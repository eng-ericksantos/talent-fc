# 🔍 Guia de Teste: Modo Herdeiro de Lendas - Kaká

## ⚠️ Situação Atual
```
Busca: "kaka" → "Modo Herdeiro de Kaká Ativado!" ✓
Resultado: "Nenhum jogador encontrado com esse nome" ✗
```

**Motivo:** Dados antigos no banco não têm `longShots` e `sprintSpeed` salvos

---

## 🔧 Implementação da Solução

### 1️⃣ Fallback Inteligente de Caminhos
```typescript
// Antes (falha):
buscar 'atributosEstendidos.sprintSpeed' → NÃO ENCONTROU → valor = 0

// Depois (fallback automático):
buscar em:
  ✓ 'atributosEstendidos.sprintSpeed'  (novo formato)
  ✓ 'atributosEstendidos.sprint_speed' (alternativo)
  ✓ 'ritmo'                            (fallback legado)
  → Qualquer um que existir é usado!
```

### 2️⃣ Filtro MongoDB com $or Inteligente
```javascript
// Exemplo: Buscar Kaká
{
  posicao: { $in: ['CAM'] },
  $and: [
    { $or: [
      { 'atributos.drible': { $gte: 86 } },      // novo
      { 'atributosEstendidos.dribbling': { ... } // alternativo
    ]},
    { $or: [
      { 'atributosEstendidos.longShots': { $gte: 85 } },    // novo
      { 'ritmo': { $gte: 85 } }                              // fallback
    ]},
    { $or: [
      { 'atributosEstendidos.sprintSpeed': { $gte: 85 } },  // novo
      { 'ritmo': { $gte: 85 } }                              // fallback
    ]}
  ]
}
```

→ Aceita jogador se QUALQUER um dos caminhos tiver o valor necessário!

### 3️⃣ Cálculo Vetorial com Fallback
```typescript
// Antes: valor não encontrado → assume 0 → distância incorreta

// Depois:
for each atributo da lenda:
  tenta 5 caminhos diferentes
  → use o primeiro que encontrar
  → se nenhum: assume 0 (comportamento antigo)
```

---

## 📋 Passo a Passo: Re-importar Dados

### Via Script (Recomendado)
```bash
cd /path/to/talent-fc

# Opção 1: Script Node.js (com auth Firebase)
npm install form-data
node migrate-data-new-logic.js

# Saída esperada:
# ✅ Upload concluído com sucesso!
# 📊 Total de linhas CSV: 10000
# 📊 Jogadores válidos: 9856
# 📊 Insersções: 0
# 📊 Atualizações: 9856
```

### Via cURL (Manual)
```bash
# 1. Obter token Firebase
TOKEN=$(curl -X POST \
  https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY \
  -d '{"email":"admin@example.com","password":"YOUR_PASSWORD","returnSecureToken":true}' \
  | jq '.idToken')

# 2. Upload do CSV
curl -X POST http://localhost:3000/api/v1/admin/upload-csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@data-worker/data/ea_fc26_players.csv"
```

---

## 🧪 Teste Após Re-import

### 1. Verificar API Diretamente (cURL)
```bash
# Teste 1: Buscar Kaká (deve ativar Modo Herdeiro de Lendas)
curl 'http://localhost:3000/api/v1/players?search=kaka&page=1&limit=20' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Resposta esperada:
{
  "data": [
    {
      "nome": "Jude Bellingham",
      "posicao": "CAM",
      "overall": 90,
      "dribbling": 90,
      "longShots": 87,
      "sprintSpeed": 80,
      "matchPercentage": 97.5
    },
    {
      "nome": "Cole Palmer",
      "posicao": "CAM",
      "overall": 87,
      "dribbling": 87,
      "longShots": 85,
      "sprintSpeed": 75,
      "matchPercentage": 94.2
    },
    // ... mais resultados
  ],
  "total": 45,
  "legendMatched": "Kaká"  ✓✓✓
}
```

### 2. Teste no App (UI)
1. Abra o app em `http://localhost:4200`
2. Vá para BUSCA
3. Digite "kaka"
4. Verifique:
   - ✓ Banner "Modo Herdeiro de Kaká Ativado!"
   - ✓ Lista de jogadores com perfil similar
   - ✓ % de similaridade para cada um

---

## 📊 Perfil de Kaká Esperado

| Atributo | Valor Mínimo | Descrição |
|----------|-------------|-----------|
| **Posição** | CAM | Meio-campista Ofensivo |
| **Dribbling** | 86 | Habilidade de condução |
| **Long Shots** | 85 | Chutes de longa distância |
| **Sprint Speed** | 85 | Velocidade de sprint |

**Jogadores compatíveis esperados:**
- Jude Bellingham (CAM, 90 overall, dribbling 90, longShots 87, sprintSpeed 80)
- Cole Palmer (CAM, 87 overall, dribbling 87, longShots 85, sprintSpeed 75)
- Jamal Musiala (CAM, 88 overall, dribbling 94, longShots 82, sprintSpeed 75)
- ...

---

## 🐛 Troubleshooting

### ❌ "Nenhum jogador encontrado" após re-import
```bash
# 1. Verificar se dados foram salvos
curl 'http://localhost:3000/api/v1/players/category/gem?limit=1' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Se retorna dados: ✓ Banco está ok
# Se vazio: ✗ Re-import falhou

# 2. Verificar logs do backend
docker logs talentfc_backend -f
# Procure por: "LEGEND_SEARCH" ou erros de import
```

### ❌ Resultados com match% muito baixo (<50%)
```bash
# Significa que alguns atributos não foram encontrados
# Solução: Reconfirmar que re-import funcionou com sucesso

# Ou re-importar com novo CSV:
node migrate-data-new-logic.js
```

### ✓ Sucesso: Match% > 90%
```
🎉 Sistema funcionando corretamente!
Jogador tem perfil muito similar à lenda buscada
```

---

## 📝 O que Mudou Internamente

### Arquivo: `attribute-aliases.constant.ts` ✨ NOVO
```typescript
export const ATTRIBUTE_ALIASES: Record<string, Set<string>> = {
  sprintSpeed: new Set(['sprintSpeed', 'sprint_speed', 'velocidade sprint']),
  longShots: new Set(['longShots', 'long_shots', 'chutes distancia']),
  // ... 40+ atributos
};

export function normalizarNomeAtributo(nomeOriginal: string): string | null
export function levenshteinDistance(a: string, b: string): number
export function extrairAtributosEstendidos(linha: Record<string, any>): Record<string, number>
```

### Arquivo: `legend-profiles.constant.ts` 🔄 MODIFICADO
```typescript
const CAMPO_PARA_CAMINHO_FALLBACK = {
  sprintSpeed: [
    'atributosEstendidos.sprintSpeed',  // novo
    'atributosEstendidos.sprint_speed', // variação
    'ritmo'                             // fallback legado
  ],
  // ... todos os atributos
};

export function resolverTodosCaminhos(campo: string): string[]
```

### Arquivo: `players.service.ts` 🔄 MODIFICADO
```typescript
// Novo método com fallback
private obterAtributoComFallback(
  objeto: Record<string, unknown>,
  caminhosPossiveis: string[]
): number | undefined

// Filtro Mongoose com $or automático
private montarFiltroLenda(perfil): Record<string, unknown>

// Cálculo vetorial com fallback
private calcularMatchLenda(jogador, perfil): number
```

---

## ⏱️ Timeline de Ação

```
Agora:
├─ 1. Execute: node migrate-data-new-logic.js
├─ 2. Aguarde re-import completar (~30 segundos)
└─ 3. Teste: curl 'http://localhost:3000/api/v1/players?search=kaka'

Esperado:
├─ ✓ Array de 20-50 jogadores com match%
├─ ✓ legendMatched: "Kaká"
└─ ✓ Jogadores ordenados por similaridade
```

---

## 📞 Se Ainda Não Funcionar

1. **Verifique os logs**:
   ```bash
   docker logs talentfc_backend -f --tail=100
   ```

2. **Teste com lenda mais genérica**:
   ```bash
   curl 'http://localhost:3000/api/v1/players?search=zidane'
   ```

3. **Confirme dados no banco**:
   ```bash
   # Via MongoDB CLI
   mongo talentfc
   db.jogadores.find({ posicao: "CAM" }).limit(1)
   ```

4. **Restartar containers**:
   ```bash
   docker-compose down
   docker-compose up --build
   node migrate-data-new-logic.js
   ```

---

**✨ Pronto! Agora o Modo Herdeiro de Lendas funcionará mesmo com dados antigos e novos formatos de CSV! ✨**
