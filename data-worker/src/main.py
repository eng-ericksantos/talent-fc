from fastapi import FastAPI
from pymongo.collection import Collection
from db_config import obter_colecao
from math_engine import filtrar_candidatos_zidane

app = FastAPI(title="TalentFC Data Worker")

JOGADORES_SEED: list[dict] = [
    {
        "nome": "Lamine Yamal",        "idade": 17, "overall": 82, "potencial": 95,
        "posicao": "RW",               "nacionalidade": "Espanha",
        "valorMercado": "€90M",        "fotoUrl": "https://cdn.sofifa.net/players/278166/25_240.png",
        "categoria": "wonderkid",
        "atributos": {"visao": 85, "passe_curto": 83, "controle_bola": 90, "compostura": 82, "drible": 92, "agilidade": 95},
    },
    {
        "nome": "Pedri González",       "idade": 22, "overall": 87, "potencial": 93,
        "posicao": "CM",               "nacionalidade": "Espanha",
        "valorMercado": "€120M",       "fotoUrl": "https://cdn.sofifa.net/players/261777/25_240.png",
        "categoria": "wonderkid",
        "atributos": {"visao": 91, "passe_curto": 90, "controle_bola": 92, "compostura": 90, "drible": 88, "agilidade": 89},
    },
    {
        "nome": "Warren Zaïre-Emery",   "idade": 18, "overall": 79, "potencial": 91,
        "posicao": "CM",               "nacionalidade": "França",
        "valorMercado": "€55M",        "fotoUrl": "https://cdn.sofifa.net/players/270893/25_240.png",
        "categoria": "wonderkid",
        "atributos": {"visao": 84, "passe_curto": 85, "controle_bola": 87, "compostura": 83, "drible": 84, "agilidade": 88},
    },
    {
        "nome": "Enzo Le Fée",          "idade": 24, "overall": 78, "potencial": 86,
        "posicao": "CM",               "nacionalidade": "França",
        "valorMercado": "€30M",        "fotoUrl": "https://cdn.sofifa.net/players/266139/25_240.png",
        "categoria": "gem",
        "atributos": {"visao": 88, "passe_curto": 87, "controle_bola": 89, "compostura": 91, "drible": 85, "agilidade": 86},
    },
    {
        "nome": "Hannibal Mejbri",      "idade": 22, "overall": 76, "potencial": 85,
        "posicao": "CM",               "nacionalidade": "Tunísia",
        "valorMercado": "€18M",        "fotoUrl": "https://cdn.sofifa.net/players/268917/25_240.png",
        "categoria": "wonderkid",
        "atributos": {"visao": 82, "passe_curto": 83, "controle_bola": 84, "compostura": 80, "drible": 83, "agilidade": 87},
    },
    {
        "nome": "Rayan Cherki",         "idade": 21, "overall": 79, "potencial": 90,
        "posicao": "CAM",              "nacionalidade": "França",
        "valorMercado": "€45M",        "fotoUrl": "https://cdn.sofifa.net/players/265809/25_240.png",
        "categoria": "wonderkid",
        "atributos": {"visao": 89, "passe_curto": 88, "controle_bola": 91, "compostura": 87, "drible": 90, "agilidade": 91},
    },
    {
        "nome": "Nico González",        "idade": 22, "overall": 78, "potencial": 87,
        "posicao": "CM",               "nacionalidade": "Espanha",
        "valorMercado": "€28M",        "fotoUrl": "https://cdn.sofifa.net/players/261993/25_240.png",
        "categoria": "gem",
        "atributos": {"visao": 83, "passe_curto": 84, "controle_bola": 85, "compostura": 84, "drible": 80, "agilidade": 83},
    },
    {
        "nome": "Manu Koné",            "idade": 23, "overall": 80, "potencial": 88,
        "posicao": "CDM",              "nacionalidade": "França",
        "valorMercado": "€35M",        "fotoUrl": "https://cdn.sofifa.net/players/262622/25_240.png",
        "categoria": "gem",
        "atributos": {"visao": 80, "passe_curto": 82, "controle_bola": 83, "compostura": 85, "drible": 79, "agilidade": 82},
    },
    {
        "nome": "Luka Modrić",          "idade": 39, "overall": 85, "potencial": 83,
        "posicao": "CM",               "nacionalidade": "Croácia",
        "valorMercado": "€8M",         "fotoUrl": "https://cdn.sofifa.net/players/177003/25_240.png",
        "categoria": "veteran",
        "atributos": {"visao": 94, "passe_curto": 92, "controle_bola": 95, "compostura": 94, "drible": 90, "agilidade": 87},
    },
    {
        "nome": "Karim Benzema",        "idade": 37, "overall": 84, "potencial": 82,
        "posicao": "ST",               "nacionalidade": "França",
        "valorMercado": "€12M",        "fotoUrl": "https://cdn.sofifa.net/players/165153/25_240.png",
        "categoria": "veteran",
        "atributos": {"visao": 88, "passe_curto": 84, "controle_bola": 88, "compostura": 92, "drible": 83, "agilidade": 75},
    },
]


def _sincronizar_seed(colecao: Collection) -> None:
    """Faz upsert de cada jogador pelo nome, preservando dados existentes."""
    for jogador in JOGADORES_SEED:
        colecao.update_one(
            {"nome": jogador["nome"]},
            {"$set": jogador},
            upsert=True,
        )
    print(f"[seed] {len(JOGADORES_SEED)} jogadores sincronizados.")


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


@app.post("/run-scraper")
def executar_scraper() -> dict:
    """Executa seed + cálculo de similaridade e retorna os candidatos encontrados."""
    colecao: Collection = obter_colecao()
    _sincronizar_seed(colecao)
    candidatos = _atualizar_match_percentages(colecao)

    resultado = [
        {"nome": c["nome"], "posicao": c["posicao"], "matchPercentage": c["matchPercentage"]}
        for c in candidatos
    ]
    print(f"[worker] {len(candidatos)} candidato(s) processado(s).")
    return {"candidatos": resultado, "total": len(candidatos)}


def main() -> None:
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
