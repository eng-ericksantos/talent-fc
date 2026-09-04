# Integração Frontend: Upload de CSV no Admin Panel

## Visão Geral

Integração completa do upload de CSV no painel administrativo Angular. O usuário pode:
1. Selecionar um arquivo CSV
2. Fazer upload autenticado com token JWT
3. Ver resultado em tempo real

## Arquivos Modificados/Criados

### 1. **admin.service.ts** (NOVO)
- Serviço responsável por comunicar com o backend
- Métodos:
  - `uploadCSV(file, token)` - Faz upload autenticado
  - `limparResultado()` - Limpa resultado e erro
- Signals:
  - `uploading` - Estado de carregamento
  - `uploadResult` - Resultado do upload bem-sucedido
  - `uploadError` - Mensagem de erro

### 2. **admin.page.ts** (ATUALIZADO)
- Novos métodos:
  - `abrirSeletorArquivo()` - Abre input file
  - `onFileSelected(event)` - Captura arquivo selecionado
  - `uploadCSV()` - Orquestra upload com token
  - `limparResultado()` - Limpa mensagens
- Novo signal:
  - `selectedFileName` - Nome do arquivo selecionado
- ViewChild:
  - `fileInput` - Referência para o input file hidden

### 3. **admin.page.html** (ATUALIZADO)
- Input file hidden (`#fileInput`)
- Nova seção de upload com:
  - Botão "Selecionar Arquivo CSV"
  - Exibição do nome do arquivo
  - Botão "Enviar CSV"
  - Alerta de sucesso (verde)
  - Alerta de erro (vermelho)

### 4. **Traduções** (pt.json, en.json, es.json)
Adicionadas 10 novas chaves:
- `UPLOAD_CSV_TITLE` - Título da seção
- `UPLOAD_CSV_DESC` - Descrição
- `SELECT_FILE` - Botão selecionar
- `UPLOADING` - Estado carregando
- `UPLOAD_CSV_BUTTON` - Botão enviar
- `TOTAL_PLAYERS` - Rótulo total
- `NEW_RECORDS` - Rótulo novos
- `UPDATED` - Rótulo atualizados
- `ERROR_UPLOAD` - Rótulo erro

## Fluxo de Uso

```
Usuário Admin
    ↓
Clica "Selecionar Arquivo CSV"
    ↓
Escolhe arquivo .csv no computador
    ↓
Nome aparece na interface
    ↓
Clica "Enviar CSV"
    ↓
Sistema obtém token JWT do FirebaseAuth
    ↓
Envia POST /admin/upload-csv com FormData + token
    ↓
Backend valida admin claim e processa CSV
    ↓
Resposta com resultado do upsert
    ↓
Interface mostra: ✓ "X jogadores processados"
    ↓
Admin pode limpar e fazer novo upload
```

## Testes Manuais

### Teste 1: Upload Bem-Sucedido
```bash
# Pré-requisitos:
# 1. Usuário com admin: true no Firebase
# 2. Arquivo CSV válido (ex: exemplo_csv_upload.csv)

# Passos:
1. Login com usuário admin
2. Ir para aba Admin
3. Clicar "Selecionar Arquivo CSV"
4. Escolher exemplo_csv_upload.csv
5. Clicar "Enviar CSV"

# Esperado:
✓ Mensagem: "15 jogadores processados com sucesso."
✓ Total de Jogadores: 15
✓ Novos Registros: 15
✓ Atualizados: 0
```

### Teste 2: Sem Arquivo Selecionado
```bash
# Pré-requisitos:
# Mesmo acesso admin

# Passos:
1. NÃO selecionar nenhum arquivo
2. Tentar clicar "Enviar CSV"

# Esperado:
- Botão "Enviar CSV" desabilitado (opacity-50, cursor-not-allowed)
```

### Teste 3: Arquivo Inválido
```bash
# Pré-requisitos:
# Arquivo TXT ou outro formato não-CSV

# Passos:
1. Selecionar arquivo.txt
2. Clicar "Enviar CSV"

# Esperado:
⚠ Mensagem: "Apenas arquivos CSV são permitidos."
```

### Teste 4: Arquivo Vazio
```bash
# Pré-requisitos:
# Arquivo .csv sem conteúdo

# Passos:
1. Selecionar arquivo vazio.csv
2. Clicar "Enviar CSV"

# Esperado:
⚠ Mensagem: "Arquivo CSV vazio."
```

### Teste 5: Sem Permissão de Admin
```bash
# Pré-requisitos:
# Usuário logado sem admin: true no Firebase

# Passos:
1. Login com usuário comum
2. Tentar acessar aba Admin

# Esperado:
- Mensagem: "Acesso negado. Apenas administradores..."
- Botão para fazer logout
```

### Teste 6: Token Expirado
```bash
# Pré-requisitos:
# Token JWT expirado

# Passos:
1. Deixar sessão aberta por 1 hora
2. Tentar fazer upload

# Esperado:
⚠ Mensagem: "Acesso negado. Apenas administradores..."
```

## Validação Visual

### Antes do Upload
```
┌─────────────────────────────────────────────────┐
│ 📄 Selecionar Arquivo CSV                       │
├─────────────────────────────────────────────────┤
│ (nenhum arquivo selecionado)                    │
│                                                 │
│ [Enviar CSV] (desabilitado)                     │
└─────────────────────────────────────────────────┘
```

### Com Arquivo Selecionado
```
┌─────────────────────────────────────────────────┐
│ 📄 Selecionar Arquivo CSV           ✓           │
├─────────────────────────────────────────────────┤
│ exemplo_csv_upload.csv                          │
│                                                 │
│ [Enviar CSV] (ativo)                            │
└─────────────────────────────────────────────────┘
```

### Upload em Progresso
```
┌─────────────────────────────────────────────────┐
│ 📄 Selecionar Arquivo CSV           ✓           │
├─────────────────────────────────────────────────┤
│ exemplo_csv_upload.csv                          │
│                                                 │
│ [Enviando CSV...] (desabilitado, spinner)      │
└─────────────────────────────────────────────────┘
```

### Após Sucesso
```
┌─────────────────────────────────────────────────┐
│ ✓ 15 jogadores processados com sucesso.         │
│                                                 │
│ Total de Jogadores: 15                          │
│ Novos Registros: 15 | Atualizados: 0            │
│                                              ✕  │
└─────────────────────────────────────────────────┘
```

### Com Erro
```
┌─────────────────────────────────────────────────┐
│ ⚠ Erro ao fazer upload                          │
│                                                 │
│ Arquivo CSV vazio.                              │
│                                              ✕  │
└─────────────────────────────────────────────────┘
```

## Variáveis de Ambiente Necessárias

### frontend/environment.ts
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000', // URL do backend
  production: false
};
```

### frontend/environment.prod.ts
```typescript
export const environment = {
  apiUrl: 'https://api.talentfc.com', // URL de produção
  production: true
};
```

## Logs do Console (Development)

```javascript
// Sucesso:
[AdminService] Upload bem-sucedido: {
  "sucesso": true,
  "mensagem": "15 jogadores processados com sucesso.",
  "totalLinhasCSV": 15,
  "totalJogadoresValidos": 15,
  "operacoes": { "insercoes": 15, "atualizacoes": 0 }
}

// Erro:
[AdminService] Erro ao fazer upload: {
  "error": {
    "statusCode": 403,
    "message": "Acesso negado. Apenas administradores..."
  }
}
```

## Responsividade

A interface é 100% responsiva:
- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)

Classes Tailwind aplicadas:
- `p-4` - Padding responsivo
- `space-y-4` - Espaçamento entre elementos
- `w-full` - Largura total
- `h-11` - Altura consistente
- `rounded-xl` - Bordas arredondadas

## Acessibilidade

Implementado:
- ✅ Botões com `disabled` state
- ✅ Mensagens de erro/sucesso diferenciadas por cor
- ✅ Cursor feedback (opacity-50, cursor-not-allowed)
- ✅ Labels em português, inglês e espanhol
- ✅ ARIA labels (implícitos)

## Performance

- ✅ Lazy loading do admin-page chunk
- ✅ Signals não disparam renders desnecessários
- ✅ FormData evita serialização JSON desnecessária
- ✅ Validação local antes de enviar

## Segurança

- ✅ Token JWT obtido do FirebaseAuth atual
- ✅ Enviado no header Authorization
- ✅ Backend valida custom claim admin
- ✅ Sem exposição de dados sensíveis no cliente

## Próximos Passos

1. ✅ Integração com backend (POST /admin/upload-csv)
2. ✅ Validação de arquivo no cliente
3. ✅ Exibição de resultado em tempo real
4. 🔄 Adicionar drag-and-drop para arquivo
5. 🔄 Histórico de uploads com auditoria
6. 🔄 Upload múltiplo (vários arquivos)
7. 🔄 Preview das linhas antes de confirmar
8. 🔄 Notificação em tempo real (WebSocket)
