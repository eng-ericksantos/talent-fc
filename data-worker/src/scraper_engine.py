import re
import time
import requests
from bs4 import BeautifulSoup, Tag

SOFIFA_BASE_URL: str = "https://sofifa.com/players"
TAMANHO_PAGINA: int = 60  # sofifa.com exibe 60 jogadores por página

_HEADERS: dict[str, str] = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Referer": "https://sofifa.com/",
}

# Bias de atributos por grupo de posição (multiplicadores relativos ao overall)
_BIAS_POSICAO: dict[str, dict[str, float]] = {
    "CM":  {"visao": 0.97, "passe_curto": 0.96, "controle_bola": 0.97, "compostura": 0.96, "drible": 0.95, "agilidade": 0.94},
    "CAM": {"visao": 0.98, "passe_curto": 0.95, "controle_bola": 0.96, "compostura": 0.94, "drible": 0.97, "agilidade": 0.96},
    "CDM": {"visao": 0.92, "passe_curto": 0.93, "controle_bola": 0.93, "compostura": 0.96, "drible": 0.89, "agilidade": 0.91},
    "LM":  {"visao": 0.90, "passe_curto": 0.91, "controle_bola": 0.93, "compostura": 0.90, "drible": 0.96, "agilidade": 0.97},
    "RM":  {"visao": 0.90, "passe_curto": 0.91, "controle_bola": 0.93, "compostura": 0.90, "drible": 0.96, "agilidade": 0.97},
}
_BIAS_PADRAO: dict[str, float] = {k: 0.88 for k in ("visao", "passe_curto", "controle_bola", "compostura", "drible", "agilidade")}


def estimar_atributos(overall: int, posicao: str) -> dict[str, int]:
    """Gera atributos estimados deterministicamente a partir do overall e posição."""
    bias = _BIAS_POSICAO.get(posicao, _BIAS_PADRAO)
    return {chave: max(40, round(overall * fator)) for chave, fator in bias.items()}


def _extrair_jogador_da_linha(linha: Tag) -> dict | None:
    """Extrai campos de uma <tr> da tabela de jogadores do sofifa.com."""
    try:
        celulas = linha.find_all("td")
        if len(celulas) < 7:
            return None

        col_info = celulas[1]
        link = col_info.find("a", href=re.compile(r"/player/\d+/"))
        if not link:
            return None

        nome: str = link.get_text(strip=True)
        sofifa_id_match = re.search(r"/player/(\d+)/", link.get("href", ""))
        sofifa_id: str = sofifa_id_match.group(1) if sofifa_id_match else ""

        # Posições exibidas como <span class="pos ...">
        posicoes: list[str] = [
            s.get_text(strip=True)
            for s in col_info.find_all("span", class_=re.compile(r"\bpos\b"))
        ]
        posicao_principal: str = posicoes[0] if posicoes else "CM"

        idade: int = int(celulas[2].get_text(strip=True))

        overall_tag = celulas[3].find("span")
        potencial_tag = celulas[4].find("span")
        overall: int = int(overall_tag.get_text(strip=True)) if overall_tag else 0
        potencial: int = int(potencial_tag.get_text(strip=True)) if potencial_tag else 0

        if overall < 50:
            return None  # filtra dados malformados / cabeçalhos

        valor_mercado: str = celulas[6].get_text(strip=True) or "€0"

        return {
            "sofifa_id": sofifa_id,
            "nome": nome,
            "idade": idade,
            "overall": overall,
            "potencial": potencial,
            "posicao": posicao_principal,
            "valorMercado": valor_mercado,
            "fotoUrl": f"https://cdn.sofifa.net/players/{sofifa_id}/25_240.png",
            "atributos": estimar_atributos(overall, posicao_principal),
        }
    except (ValueError, AttributeError, IndexError):
        return None


def raspar_pagina(offset: int) -> list[dict]:
    """Faz a requisição HTTP e retorna a lista de jogadores extraídos da página."""
    url: str = f"{SOFIFA_BASE_URL}?lang=en-US&offset={offset}"
    try:
        resposta = requests.get(url, headers=_HEADERS, timeout=15)
        resposta.raise_for_status()
    except requests.RequestException as e:
        print(f"[scraper] Falha na requisição offset={offset}: {e}")
        return []

    soup = BeautifulSoup(resposta.text, "html.parser")
    tabela = soup.find("table", class_=re.compile(r"\btable\b"))
    if not tabela:
        print(f"[scraper] Tabela não encontrada no offset={offset}")
        return []

    linhas: list[Tag] = tabela.find("tbody").find_all("tr")  # type: ignore[union-attr]

    # list comprehension sobre a coleção completa — nenhum .find() ou next()
    jogadores: list[dict] = [
        jogador
        for linha in linhas
        if (jogador := _extrair_jogador_da_linha(linha)) is not None
    ]

    print(f"[scraper] offset={offset} → {len(jogadores)} jogadores extraídos")
    return jogadores


def raspar_lote(offset_inicial: int, num_paginas: int = 3) -> tuple[list[dict], int]:
    """
    Raspa `num_paginas` páginas a partir de `offset_inicial`.
    Retorna (lista_jogadores, próximo_offset).
    """
    todos: list[dict] = []
    for i in range(num_paginas):
        offset_atual = offset_inicial + (i * TAMANHO_PAGINA)
        todos.extend(raspar_pagina(offset_atual))
        if i < num_paginas - 1:
            time.sleep(1.5)  # intervalo entre páginas para não sobrecarregar o servidor

    proximo_offset = offset_inicial + (num_paginas * TAMANHO_PAGINA)
    return todos, proximo_offset
