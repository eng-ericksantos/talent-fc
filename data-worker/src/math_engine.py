from typing import TypedDict
import numpy as np


# Atributos técnicos usados como dimensões do espaço vetorial
AtributosJogador = TypedDict("AtributosJogador", {
    "visao": int,
    "passe_curto": int,
    "controle_bola": int,
    "compostura": int,
    "drible": int,
    "agilidade": int,
})

# Vetor de referência: Zidane no auge (EA FC 25 ratings estimados)
VETOR_ZIDANE: AtributosJogador = {
    "visao": 95,
    "passe_curto": 93,
    "controle_bola": 97,
    "compostura": 96,
    "drible": 93,
    "agilidade": 89,
}

# Posições consideradas meia para o filtro "Novo Zidane"
POSICOES_MEIA: frozenset[str] = frozenset({"CM", "CAM", "CDM", "LM", "RM"})
IDADE_MAXIMA_PROMESSA: int = 27
LIMIAR_MATCH: float = 85.0


def _vetor_numpy(atributos: AtributosJogador) -> np.ndarray:
    return np.array(list(atributos.values()), dtype=float)


def calcular_similaridade(a: AtributosJogador, b: AtributosJogador) -> float:
    """
    Similaridade baseada em distância euclidiana normalizada (0–100).
    Mais discriminante que cosseno quando os vetores têm escalas similares.
    """
    va = _vetor_numpy(a)
    vb = _vetor_numpy(b)
    distancia = np.linalg.norm(va - vb)
    # Distância máxima teórica num espaço de N dims com atributos 0–100
    distancia_max = np.sqrt(len(va)) * 100.0
    return float(round(max(0.0, 100.0 - (distancia / distancia_max) * 100.0), 2))


def filtrar_candidatos_zidane(jogadores: list[dict]) -> list[dict]:
    """
    Calcula o matchPercentage de todos os meias jovens e retorna
    a coleção completa dos que superam o limiar — nunca apenas o primeiro.
    """
    candidatos: list[dict] = []

    for jogador in jogadores:
        eh_meia = jogador.get("posicao") in POSICOES_MEIA
        eh_jovem = jogador.get("idade", 99) <= IDADE_MAXIMA_PROMESSA
        atributos = jogador.get("atributos")

        if not (eh_meia and eh_jovem and atributos):
            continue

        match_pct = calcular_similaridade(VETOR_ZIDANE, atributos)

        if match_pct >= LIMIAR_MATCH:
            candidatos.append({**jogador, "matchPercentage": match_pct})

    # Ordena do mais similar para o menos similar
    return sorted(candidatos, key=lambda j: j["matchPercentage"], reverse=True)
