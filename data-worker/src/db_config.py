import os
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

_MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
_NOME_DB: str = os.getenv("MONGODB_DB", "talentfc")
_NOME_COLECAO: str = os.getenv("MONGODB_COLECAO", "jogadores")
_COLECAO_ESTADO: str = "scraper_state"
_CHAVE_ESTADO: str = "estado_principal"

# Cliente singleton — evita abrir nova conexão a cada chamada
_cliente: MongoClient = MongoClient(_MONGODB_URI)
_banco: Database = _cliente[_NOME_DB]


def obter_colecao() -> Collection:
    return _banco[_NOME_COLECAO]


def obter_ultimo_offset() -> int:
    doc = _banco[_COLECAO_ESTADO].find_one({"_id": _CHAVE_ESTADO})
    return int(doc["last_offset"]) if doc else 0


def atualizar_ultimo_offset(novo_offset: int) -> None:
    _banco[_COLECAO_ESTADO].update_one(
        {"_id": _CHAVE_ESTADO},
        {"$set": {"last_offset": novo_offset}},
        upsert=True,
    )
