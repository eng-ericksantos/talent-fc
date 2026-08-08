import os
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

_MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
_NOME_DB: str = os.getenv("MONGODB_DB", "talentfc")
_NOME_COLECAO: str = os.getenv("MONGODB_COLECAO", "jogadores")


def obter_colecao() -> Collection:
    cliente: MongoClient = MongoClient(_MONGODB_URI)
    banco: Database = cliente[_NOME_DB]
    return banco[_NOME_COLECAO]
