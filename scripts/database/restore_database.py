#!/usr/bin/env python3

"""
Script para restaurar dados de jogadores diretamente no MongoDB
Carrega o CSV ea_fc26_players.csv e insere no banco de dados
"""

import csv
import json
import sys
from pathlib import Path
from pymongo import MongoClient
from datetime import datetime

# Configurar caminho
CSV_PATH = Path(__file__).parent / "data-worker" / "data" / "ea_fc26_players.csv"
MONGO_URI = "mongodb://localhost:27017/talentfc"

def normalize_field(value):
    """Normaliza valor de campo do CSV"""
    if not value or value.strip() == "":
        return None
    
    # Tentar converter para número
    try:
        if "." in str(value):
            return float(value)
        return int(value)
    except (ValueError, TypeError):
        return value.strip()

def map_csv_to_jogador(row):
    """Mapeia linha CSV para documento Jogador"""
    
    return {
        "nome": normalize_field(row.get("commonName")) or normalize_field(row.get("firstName", "")),
        "eaPlayerId": int(row.get("id", 0)) if row.get("id") else 0,
        "overall": normalize_field(row.get("overallRating")),
        "potencial": normalize_field(row.get("overallRating")),  # TODO: obter do campo potencial se existir
        "posicao": normalize_field(row.get("position")),
        "nacionalidade": normalize_field(row.get("nationality")),
        "time": normalize_field(row.get("team")),
        "liga": normalize_field(row.get("leagueName")),
        "valor_mercado": normalize_field(row.get("team")),  # Placeholder
        "idade": normalize_field(row.get("birthdate")),
        "altura": normalize_field(row.get("height")),
        "peso": normalize_field(row.get("weight")),
        "pe_preferido": normalize_field(row.get("preferredFoot")),
        "habilidade_fraco": normalize_field(row.get("weakFootAbility")),
        "skill_moves": normalize_field(row.get("skillMoves")),
        "atributos": {
            "pac": normalize_field(row.get("pac")),
            "sho": normalize_field(row.get("sho")),
            "pas": normalize_field(row.get("pas")),
            "dri": normalize_field(row.get("dri")),
            "def": normalize_field(row.get("def")),
            "phy": normalize_field(row.get("phy")),
        }
    }

def restore_database():
    """Restaura base de dados com dados do CSV"""
    
    try:
        # Verificar se arquivo existe
        if not CSV_PATH.exists():
            print(f"❌ Erro: Arquivo não encontrado: {CSV_PATH}")
            sys.exit(1)
        
        file_size_mb = CSV_PATH.stat().st_size / 1024 / 1024
        print(f"📂 Arquivo encontrado: {CSV_PATH}")
        print(f"📊 Tamanho: {file_size_mb:.2f} MB")
        
        # Conectar ao MongoDB
        print("🔌 Conectando ao MongoDB...")
        client = MongoClient(MONGO_URI)
        db = client.get_database("talentfc")
        collection = db.jogadores
        
        # Contar documentos existentes
        existing_count = collection.count_documents({})
        if existing_count > 0:
            print(f"⚠️  Banco já contém {existing_count} jogadores.")
            response = input("Deseja apagar e recarregar? (s/n): ").strip().lower()
            if response == "s":
                collection.delete_many({})
                print("🗑️  Documentos antigos removidos.")
            else:
                print("Operação cancelada.")
                sys.exit(0)
        
        # Ler CSV
        print("📖 Lendo arquivo CSV...")
        jogadores = []
        
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row_num, row in enumerate(reader, 1):
                jogador = map_csv_to_jogador(row)
                
                # Validação básica
                if jogador.get("eaPlayerId") and jogador.get("eaPlayerId") > 0:
                    jogadores.append(jogador)
                
                if row_num % 100 == 0:
                    print(f"  Processados {row_num} registros...")
        
        print(f"✅ {len(jogadores)} jogadores válidos extraídos do CSV")
        
        if not jogadores:
            print("❌ Erro: Nenhum jogador válido encontrado no CSV")
            sys.exit(1)
        
        # Inserir no MongoDB
        print("💾 Inserindo jogadores no MongoDB...")
        result = collection.insert_many(jogadores)
        
        print(f"✅ Restauração concluída com sucesso!")
        print(f"✅ {len(result.inserted_ids)} jogadores inseridos")
        print(f"✅ Total no banco: {collection.count_documents({})}")
        
        client.close()
        sys.exit(0)
        
    except Exception as erro:
        print(f"❌ Erro: {erro}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    restore_database()
