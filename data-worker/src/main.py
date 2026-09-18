from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import FastAPI
from pymongo.collection import Collection

from db_config import obter_colecao
from math_engine import filtrar_candidatos_zidane

app = FastAPI(title="TalentFC Data Worker")

CAMINHO_CSV: Path = Path(__file__).resolve().parent.parent / "data" / "ea_fc26_players.csv"

# Sub-atributos brutos além dos 6 usados no motor Zidane — mantidos com o nome original da EA
COLUNAS_ESTENDIDAS: list[str] = [
    "defensiveAwareness", "standingTackle", "slidingTackle", "longPassing", "sprintSpeed",
    "acceleration", "finishing", "shotPower", "longShots", "crossing", "headingAccuracy",
    "strength", "reactions", "balance", "jumping", "penalties", "curve", "freeKickAccuracy",
    "positioning", "volleys", "aggression", "gkReflexes", "gkDiving", "gkHandling",
    "gkPositioning", "gkKicking",
]


def _calcular_idade(nascimento: pd.Timestamp) -> int:
    """Idade em anos completos, calculada a partir do birthdate do CSV oficial."""
    hoje = datetime.now()
    return hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))


def _estimar_potencial(overall: int, idade: int) -> int:
    """O dataset oficial não traz potencial de carreira; estimamos a margem de crescimento pela idade."""
    margem = max(0, 23 - idade) * 2
    return min(99, overall + margem)


def _estimar_valor_mercado(overall: int, potencial: int) -> str:
    """O dataset oficial não traz valor de mercado; aproximamos pelo overall e pela margem de crescimento."""
    base = max(1, (overall - 60) * 3)
    bonus_juventude = (potencial - overall) * 2
    return f"€{base + bonus_juventude}M"


def _inferir_categoria(idade: int, overall: int, potencial: int) -> str:
    """Determina categoria baseada em idade/overall/potencial sem iterar com find/next."""
    regras: list[tuple[bool, str]] = [
        (idade <= 21 and potencial >= 80, "wonderkid"),
        (idade <= 27 and overall < potencial - 5, "gem"),
        (idade >= 32 and overall >= 80, "veteran"),
    ]
    # filter() sobre a coleção completa de regras — nunca next()
    categorias_ativas = [cat for condicao, cat in regras if condicao]
    return categorias_ativas[0] if categorias_ativas else "gem"


def _linha_para_documento(linha: "pd.Series[object]") -> dict:
    """Mapeia uma linha do DataFrame oficial da EA (ea_fc26_players.csv) para o schema do MongoDB."""
    overall = int(linha["overallRating"])
    idade = _calcular_idade(linha["birthdate"])
    potencial = _estimar_potencial(overall, idade)
    nome_comum = str(linha["commonName"]).strip()
    nome = nome_comum if nome_comum and nome_comum.lower() != "nan" else f"{linha['firstName']} {linha['lastName']}".strip()

    return {
        "eaPlayerId": int(linha["id"]),
        "nome": nome,
        "idade": idade,
        "overall": overall,
        "potencial": potencial,
        "posicao": linha["position"],
        "nacionalidade": linha["nationality"],
        "valorMercado": _estimar_valor_mercado(overall, potencial),
        "categoria": _inferir_categoria(idade, overall, potencial),
        "resistencia": int(linha["stamina"]),
        "interceptacoes": int(linha["interceptions"]),
        "ritmo": int(linha["pac"]),
        "finalizacao": int(linha["sho"]),
        "habilidades": int(linha["skillMoves"]),
        "atributos": {
            "visao": int(linha["vision"]),
            "passe_curto": int(linha["shortPassing"]),
            "controle_bola": int(linha["ballControl"]),
            "compostura": int(linha["composure"]),
            "drible": int(linha["dribbling"]),
            "agilidade": int(linha["agility"]),
        },
        "atributosEstendidos": {coluna: int(linha[coluna]) for coluna in COLUNAS_ESTENDIDAS},
    }


def _atualizar_match_percentages(colecao: Collection) -> list[dict]:
    """Calcula similaridade com Zidane e persiste matchPercentage + categoria no MongoDB."""
    todos: list[dict] = list(colecao.find({}))
    candidatos = filtrar_candidatos_zidane(todos)

    for candidato in candidatos:
        colecao.update_one(
            {"_id": candidato["_id"]},
            {"$set": {
                "matchPercentage": candidato["matchPercentage"],
                "categoria": "gem",
            }},
        )

    colecao.update_many(
        {"_id": {"$nin": [c["_id"] for c in candidatos]}, "matchPercentage": {"$exists": True}},
        {"$unset": {"matchPercentage": ""}},
    )

    return candidatos


@app.post("/run-etl")
def executar_etl() -> dict:
    """
    Carrega o dataset oficial da EA (CSV) via pandas, transforma para o schema
    do MongoDB e recarrega a coleção com bulk insert.
    """
    colecao: Collection = obter_colecao()

    df = pd.read_csv(CAMINHO_CSV, parse_dates=["birthdate"])
    registros: list[dict] = [_linha_para_documento(linha) for _, linha in df.iterrows()]

    # insert_many não faz upsert — limpamos a coleção antes para permitir recargas idempotentes
    colecao.delete_many({})
    if registros:
        colecao.insert_many(registros)
    print(f"[etl] {len(registros)} jogadores carregados do CSV oficial.")

    # --- Motor matemático sobre toda a coleção ---
    candidatos = _atualizar_match_percentages(colecao)
    resultado = [
        {"nome": c["nome"], "posicao": c["posicao"], "matchPercentage": c["matchPercentage"]}
        for c in candidatos
    ]
    print(f"[worker] {len(candidatos)} candidato(s) processado(s).")

    return {
        "carga": {"total_csv": len(registros)},
        "candidatos": resultado,
        "total": len(candidatos),
    }


def main() -> None:
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
