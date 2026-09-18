# 🔐 Configurando Permissões de Admin

## Problema Identificado

O usuário está recebendo o erro **"Token inválido ou usuário não autorizado"** ao tentar acessar endpoints de admin porque não tem o custom claim `admin: true` definido no Firebase.

## ✅ Solução

### Opção 1: Via Script Node.js (Recomendado)

1. **Execute o script:**
```bash
node set-admin-claim.js eng.erickalessandro@gmail.com
```

2. **Saída esperada:**
```
🔍 Procurando usuário com email: eng.erickalessandro@gmail.com
✅ Usuário encontrado: eng.erickalessandro@gmail.com (UID: KHYhvYZj3TUFwb8lRx1SlHiZ...)
⏳ Definindo custom claim admin=true...
✅ Custom claim definido com sucesso!
✅ O usuário eng.erickalessandro@gmail.com agora pode acessar endpoints de admin.
```

### Opção 2: Via Firebase Console (Manual)

1. Vá para: https://console.firebase.google.com/project/talentfc-f5b09/authentication/users
2. Encontre o usuário `eng.erickalessandro@gmail.com`
3. Clique em editar
4. Desça até "Custom Claims"
5. Adicione:
```json
{
  "admin": true
}
```
6. Salve e aguarde alguns segundos

## 🔄 Após Configurar

- **Faça logout** e **login novamente** no app
- Aguarde 1-2 minutos para o cache do token ser atualizado
- Teste novamente o upload do CSV

## 📋 Informações Técnicas

- **Custom Claim**: `admin: true`
- **Verificação**: Backend valida este claim no `AdminGuard`
- **Endpoints Protegidos**:
  - `POST /api/v1/admin/upload-csv` - Upload de jogadores
  - `GET /api/v1/admin/backups` - Listar backups
  - `POST /api/v1/admin/restore-backup` - Restaurar backup
  - `POST /api/v1/admin/trigger-worker` - Acionar worker
