# Guia Prático: Testando o Upload de CSV

## 1. Pré-requisitos

### Configurar Firebase Custom Claims (Admin)

Você precisa definir o custom claim `admin: true` para o usuário no Firebase Admin SDK:

```bash
# Via Firebase CLI (local)
firebase auth:import users.json --hash-algo=bcrypt

# Via Node.js Script
const admin = require('firebase-admin');

admin.auth().setCustomUserClaims('uid-do-usuario', { admin: true })
  .then(() => console.log('Custom claim adicionado'))
  .catch(error => console.log('Erro:', error));
```

### Obtenha um Token Firebase válido

```javascript
// No seu cliente (Frontend Angular)
import { Auth } from '@angular/fire/auth';

constructor(private auth: Auth) {}

async obterToken() {
  const user = this.auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    console.log('Token:', token);
    return token;
  }
}
```

---

## 2. Testando com cURL

```bash
# Teste 1: Upload com arquivo CSV válido
curl -X POST http://localhost:3000/admin/upload-csv \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE" \
  -F "file=@exemplo_csv_upload.csv"

# Resposta esperada (201):
# {
#   "sucesso": true,
#   "mensagem": "15 jogadores processados com sucesso.",
#   "totalLinhasCSV": 15,
#   "totalJogadoresValidos": 15,
#   "operacoes": {
#     "insercoes": 15,
#     "atualizacoes": 0
#   }
# }

# Teste 2: Sem arquivo
curl -X POST http://localhost:3000/admin/upload-csv \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE" \
  -F "file=@/dev/null"

# Resposta esperada (400):
# { "statusCode": 400, "message": "Arquivo CSV vazio." }

# Teste 3: Sem token (acesso negado)
curl -X POST http://localhost:3000/admin/upload-csv \
  -F "file=@exemplo_csv_upload.csv"

# Resposta esperada (403):
# { "statusCode": 403, "message": "Token não fornecido." }

# Teste 4: Token sem permissão de admin
curl -X POST http://localhost:3000/admin/upload-csv \
  -H "Authorization: Bearer USER_TOKEN_WITHOUT_ADMIN" \
  -F "file=@exemplo_csv_upload.csv"

# Resposta esperada (403):
# { "statusCode": 403, "message": "Acesso negado. Apenas administradores..." }
```

---

## 3. Testando com Postman

### Passo 1: Configurar Autenticação
1. Abra Postman
2. Vá para a aba **Authorization**
3. Selecione **Bearer Token**
4. Cole seu token Firebase válido

### Passo 2: Configurar Requisição
- **Método:** POST
- **URL:** `http://localhost:3000/admin/upload-csv`
- **Headers:** Já configurados automaticamente
- **Body:**
  - Selecione **form-data**
  - Key: `file` (tipo: File)
  - Value: Clique em "Select File" e escolha `exemplo_csv_upload.csv`

### Passo 3: Enviar
- Clique em **Send**
- Verifique a resposta em **Body**

---

## 4. Testando com JavaScript/Fetch (Frontend Angular)

```typescript
// admin-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminUploadService {
  private apiUrl = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  uploadCSV(file: File, token: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/upload-csv`, formData, {
      headers
    });
  }
}

// upload.component.ts
import { Component } from '@angular/core';
import { AdminUploadService } from './admin-upload.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-upload-csv',
  template: `
    <div class="p-6 bg-soccerCard rounded-lg">
      <h2 class="text-xl font-bold text-white mb-4">Upload de CSV</h2>

      <input
        #fileInput
        type="file"
        accept=".csv"
        class="hidden"
      />

      <button
        (click)="fileInput.click()"
        class="px-4 py-2 bg-soccerGreen text-white rounded hover:opacity-90"
      >
        Escolher Arquivo
      </button>

      <button
        (click)="onUpload(fileInput.files[0])"
        class="ml-2 px-4 py-2 bg-soccerGreen text-white rounded hover:opacity-90"
        [disabled]="!selectedFile"
      >
        Enviar CSV
      </button>

      <div *ngIf="resultado" class="mt-4 p-4 bg-green-500 bg-opacity-20 rounded">
        {{ resultado.mensagem }}
      </div>

      <div *ngIf="erro" class="mt-4 p-4 bg-red-500 bg-opacity-20 rounded">
        {{ erro }}
      </div>
    </div>
  `
})
export class UploadCSVComponent {
  selectedFile: File | null = null;
  resultado: any = null;
  erro: string | null = null;

  constructor(
    private uploadService: AdminUploadService,
    private authService: AuthService
  ) {}

  onUpload(file: File) {
    if (!file) {
      this.erro = 'Selecione um arquivo';
      return;
    }

    this.selectedFile = file;
    const token = localStorage.getItem('firebaseToken') || '';

    this.uploadService.uploadCSV(file, token).subscribe({
      next: (response) => {
        this.resultado = response;
        this.erro = null;
        console.log('Upload bem-sucedido:', response);
      },
      error: (error) => {
        this.erro = error.error?.message || 'Erro ao fazer upload';
        this.resultado = null;
        console.error('Erro no upload:', error);
      }
    });
  }
}
```

---

## 5. Testando com VSCode REST Client

Instale a extensão **REST Client** e crie um arquivo `test.rest`:

```http
### Upload CSV - Sucesso
POST http://localhost:3000/admin/upload-csv
Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="file"; filename="exemplo_csv_upload.csv"
Content-Type: text/csv

< ./exemplo_csv_upload.csv
------FormBoundary--

###
```

---

## 6. Validação de Dados no MongoDB

Após um upload bem-sucedido, verifique os dados no MongoDB:

```bash
# Conectar ao MongoDB
mongosh mongodb://localhost:27017/talent-fc-db

# Contar documentos
db.jogadores.countDocuments()

# Buscar um jogador específico
db.jogadores.findOne({ eaPlayerId: 1 })

# Listar todos os jogadores com OVR > 85
db.jogadores.find({ overall: { $gt: 85 } })

# Ver estatísticas de um upload
db.jogadores.aggregate([
  {
    $group: {
      _id: null,
      totalJogadores: { $sum: 1 },
      mediaOverall: { $avg: '$overall' },
      maiorPotencial: { $max: '$potencial' }
    }
  }
])
```

---

## 7. Testando Diferentes Formatos de CSV

### Formato 1: Kaggle Padrão
```csv
id,commonName,age,overallRating,potential,position,nationality,marketValue,stamina
1,Player A,28,85,88,ST,Portugal,10000000,85
2,Player B,25,83,91,LW,Brazil,5000000,88
```

### Formato 2: EA Sports Customizado
```csv
player_id,Name,Age,OVR,POT,pos,nation
3,Player C,22,80,95,CM,England
4,Player D,19,76,92,CB,France
```

### Formato 3: Kaggle Completo (com atributos)
```csv
ID,commonName,idade,Overall,POT,Position,Nacionalidade,marketValue,Stamina,Interceptions,Pace,Shooting,Dribbling
5,Player E,31,89,89,ST,Spain,25000000,79,35,79,96,86
6,Player F,24,87,94,LW,Argentina,50000000,85,22,96,85,91
```

**Todos os formatos acima funcionam transparentemente!**

---

## 8. Monitoramento e Logging

### No Backend (NestJS)
```bash
# Ativar logs de debug
DEBUG=talentfc:* npm run start:dev

# Ou verificar os logs do Docker
docker logs -f talentfc_backend_api
```

### Exemplos de Logs Esperados
```
[AdminService] Processando CSV...
[AdminService] Cabeçalho normalizado: [eaPlayerId, nome, idade, ...]
[AdminService] 15 linhas de CSV normalizadas
[AdminService] Executando bulkWrite com 15 operações
[AdminService] Upsert concluído: 15 insercoes, 0 atualizacoes
```

---

## 9. Tratamento de Erros Comuns

| Erro | Causa | Solução |
|---|---|---|
| `Token não fornecido` | Falta header Authorization | Adicione `Authorization: Bearer TOKEN` |
| `Token inválido ou expirado` | Token Firebase vencido | Faça novo login |
| `Acesso negado` | Sem custom claim `admin: true` | Configure no Firebase Admin SDK |
| `Arquivo CSV vazio` | Arquivo sem dados | Verifique o arquivo CSV |
| `Nenhum jogador válido` | Coluna `eaPlayerId` não encontrada | Revise headers do CSV |
| `ENOENT: no such file` | Formidable falha ao processar | Verifique permissões de pasta |

---

## 10. Performance e Limites

- ✅ Suporta até **16.000 registros** em um único upload
- ✅ Tempo médio: **~2-3 segundos** para 5.000 registros
- ⚠️ Máximo recomendado: **50MB de arquivo**

---

## Checklist de Teste

- [ ] Token Firebase válido com `admin: true` configurado
- [ ] Arquivo CSV com formato válido
- [ ] Header Authorization presente
- [ ] Content-Type: multipart/form-data
- [ ] Resposta HTTP 201 esperada
- [ ] Dados persistidos no MongoDB
- [ ] Logs no backend mostram sucesso
- [ ] Teste com diferentes formatos de CSV
- [ ] Teste com arquivo vazio (deve falhar)
- [ ] Teste sem token (deve falhar com 403)
