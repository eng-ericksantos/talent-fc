#!/bin/bash
# Script de Teste Rápido: Upload de CSV
# 
# Uso: ./test-csv-upload.sh <TOKEN_FIREBASE>
# 
# Exemplo:
# ./test-csv-upload.sh eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9...

set -e

# Validação
if [ -z "$1" ]; then
    echo "❌ Erro: Token Firebase não fornecido"
    echo "Uso: $0 <TOKEN_FIREBASE>"
    echo ""
    echo "Exemplo:"
    echo "  $0 eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
    exit 1
fi

TOKEN="$1"
API_URL="http://localhost:3000/admin/upload-csv"
CSV_FILE="${2:-./src/admin/exemplo_csv_upload.csv}"

echo "╔════════════════════════════════════════════════════════╗"
echo "║           Teste de Upload de CSV - TalentFC            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Configuração:"
echo "   API URL: $API_URL"
echo "   Arquivo: $CSV_FILE"
echo "   Token: ${TOKEN:0:50}..."
echo ""

# Validar arquivo
if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Erro: Arquivo não encontrado: $CSV_FILE"
    exit 1
fi

FILE_SIZE=$(stat -f%z "$CSV_FILE" 2>/dev/null || stat -c%s "$CSV_FILE")
echo "📂 Tamanho: $(($FILE_SIZE / 1024))KB"
echo ""

# Fazer upload
echo "📤 Enviando arquivo..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$CSV_FILE")

# Verificar resposta
if echo "$RESPONSE" | grep -q '"sucesso":true'; then
    echo "✅ Upload bem-sucedido!"
    echo ""
    echo "📊 Resultado:"
    echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
elif echo "$RESPONSE" | grep -q '"statusCode"'; then
    echo "❌ Erro HTTP:"
    echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
else
    echo "⚠️  Resposta inesperada:"
    echo "$RESPONSE"
fi

echo ""
echo "✨ Teste concluído!"
