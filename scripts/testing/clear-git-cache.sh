#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# Script: clear-git-cache.sh
# Descrição: Remove todos os arquivos do índice do Git e reaplica .gitignore
# Uso: bash scripts/testing/clear-git-cache.sh
# Objetivo: Limpar cache de arquivos que deveriam ser ignorados (ex: .env, chaves)
#
# ⚠️  AVISO: Este script vai remover TODOS os arquivos do índice do Git!
#     Use apenas se tiver certeza de que commited arquivos secretos por engano.
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "🔐 Limpando cache do Git..."
echo "════════════════════════════════════════════════════════════════════════════"

# Verificar se estamos em um repositório Git
if [ ! -d .git ]; then
  echo "❌ Erro: Não estou em um repositório Git!"
  exit 1
fi

echo "📋 Removendo todos os arquivos do índice do Git..."
git rm -r --cached .

echo "📝 Reaplicando regras do .gitignore..."
git add .

echo "💾 Criando commit para limpar cache..."
git commit -m "chore: clear git cache to enforce gitignore

- Remove tracked files that should be ignored
- Reapplies .gitignore rules to all files
- Ensures no secrets are exposed in repository history"

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ Cache limpo com sucesso!"
echo ""
echo "📌 Próximos passos:"
echo "   1. Revise os arquivos removidos do índice com: git status"
echo "   2. Faça push com cuidado: git push origin main --force-with-lease"
echo "   3. Para repositórios críticos, considere usar git-filter-branch ou BFG"
echo ""
echo "⚠️  Aviso: Se .env ou credenciais foram previamente commitados,"
echo "   use git-filter-branch ou BFG Repo-Cleaner para removê-los do histórico!"
echo "════════════════════════════════════════════════════════════════════════════"
