import os
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

_MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
_NOME_DB: str = os.getenv("MONGODB_DB", "talentfc")
_NOME_COLECAO: str = os.getenv("MONGODB_COLECAO", "jogadores")

# Cliente singleton — evita abrir nova conexão a cada chamada
_cliente: MongoClient = MongoClient(_MONGODB_URI)
_banco: Database = _cliente[_NOME_DB]


def obter_colecao() -> Collection:
    return _banco[_NOME_COLECAO]
