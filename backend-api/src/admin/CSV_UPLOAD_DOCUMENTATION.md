# Documentação: Motor de Upload de CSV com Normalização Dinâmica

## Visão Geral

Sistema administrativo para upload de arquivos CSV (Kaggle, EA Sports, etc.) com:
- ✅ Normalização automática de colunas
- ✅ Dicionário de alias configurável
- ✅ Smart Upsert com bulkWrite do MongoDB
- ✅ Proteção com AdminGuard (Firebase Custom Claims)

## Endpoint

```
POST /admin/upload-csv
Content-Type: multipart/form-data
Authorization: Bearer {TOKEN_FIREBASE}
```

### Headers Obrigatórios
- `Authorization`: Bearer token Firebase com custom claim `admin: true`
- `Content-Type`: multipart/form-data

### Body
- `file`: Arquivo CSV a ser processado

### Exemplo de Requisição (cURL)

```bash
curl -X POST http://localhost:3000/admin/upload-csv \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -F "file=@players.csv"
```

### Exemplo de Requisição (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('file', csvFile); // File object from input

const response = await fetch('http://localhost:3000/admin/upload-csv', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: formData
});

const resultado = await response.json();
console.log(resultado);
```

## Estrutura de Resposta

### Sucesso (201)
```json
{
  "sucesso": true,
  "mensagem": "5000 jogadores processados com sucesso.",
  "totalLinhasCSV": 5000,
  "totalJogadoresValidos": 5000,
  "operacoes": {
    "insercoes": 1200,
    "atualizacoes": 3800
  }
}
```

### Erro (400/403)
```json
{
  "statusCode": 400,
  "message": "Arquivo CSV vazio.",
  "error": "Bad Request"
}
```

## Mapeamento de Colunas (Normalizador)

O sistema normaliza automaticamente os nomes das colunas do CSV para o padrão interno:

| Campo Interno | Aliases Aceitos |
|---|---|
| `eaPlayerId` | id, ID, player_id, playerId, eaPlayerId |
| `nome` | commonName, name, Nome, player_name, playerName |
| `idade` | age, Age, idade |
| `overall` | overallRating, OVR, overall, Overall |
| `potencial` | potential, POT, potencial |
| `posicao` | position, Position, pos, posicao |
| `nacionalidade` | nationality, Nationality, nacionalidade, nation |
| `valorMercado` | marketValue, market_value, valor, valorMercado |
| `resistencia` | stamina, Stamina, resistencia |
| `interceptacoes` | interceptions, Interceptions, interceptacoes |
| `ritmo` | pace, Pace, ritmo |
| `finalizacao` | shooting, Shooting, finalizacao |
| `habilidades` | dribbling, Dribbling, habilidades, skill |

### Exemplo de CSV Aceitos

#### Formato Kaggle Standard
```csv
id,commonName,age,overallRating,potential,position,nationality,marketValue
1,Cristiano Ronaldo,38,89,89,ST,Portugal,15000000
2,Lionel Messi,36,91,91,LW,Argentina,20000000
```

#### Formato EA Sports
```csv
player_id,Name,Age,OVR,POT,pos,nation,valor
3,Neymar Jr,31,87,87,LW,Brazil,8500000
4,Kylian Mbappé,24,91,96,ST,France,180000000
```

#### Formato Customizado
```csv
ID,Nome,idade,Overall,POT,Position,Nacionalidade,marketValue
5,Vinicius Jr,23,88,95,LW,Brazil,50000000
```

**Todos os formatos acima funcionam transparentemente!**

## Requisitos de Autenticação

### Firebase Custom Claims

O usuário deve ter a seguinte configuração no Firebase Admin SDK:

```javascript
// No Firebase Admin Console ou via Admin SDK
admin.auth().setCustomUserClaims(uid, {
  admin: true  // Identificador de administrador
});
```

### Verificação no Backend

O `AdminGuard` verifica automaticamente:
1. ✅ Presença e validade do token Firebase
2. ✅ Presença do custom claim `admin: true`
3. ✅ Rejeita com `ForbiddenException` se não autorizado

## Processamento Interno

### 1. Parse do CSV
- Utiliza `csv-parse/sync` para máxima performance
- Suporta aspas escapadas e linhas vazias
- Detecta automaticamente o charset UTF-8

### 2. Normalização de Cabeçalhos
- Mapeia cada coluna do CSV para a chave interna esperada
- Colunas não mapeadas são ignoradas
- Case-insensitive (maiúsculas/minúsculas)

### 3. Transformação de Dados
- Converte tipos (strings para números quando necessário)
- Ignora células vazias ou null
- Valida presença de `eaPlayerId` obrigatório

### 4. Upsert Inteligente (bulkWrite)
```typescript
const operacoesBulk = jogadores.map(jogador => ({
  updateOne: {
    filter: { eaPlayerId: jogador.eaPlayerId },
    update: { $set: jogador },
    upsert: true
  }
}));

await Model.bulkWrite(operacoesBulk);
```

**Características:**
- Atualiza apenas campos presentes no CSV (`$set`)
- Não sobrescreve atributos faltantes
- Cria novo registro se `eaPlayerId` não existir
- Performance O(1) para 16.000+ registros

## Tratamento de Erros

| Erro | Status | Causa | Solução |
|---|---|---|---|
| "Arquivo CSV vazio" | 400 | Buffer sem dados | Verifique o arquivo |
| "CSV contém 0 linhas" | 400 | CSV sem dados | Adicione linhas ao CSV |
| "Nenhum jogador válido" | 400 | Sem `eaPlayerId` | Verifique coluna ID |
| "Acesso negado" | 403 | Sem custom claim admin | Configure Firebase |
| "Token inválido" | 403 | Token expirado | Faça novo login |

## Exemplo Completo: Frontend Angular

```typescript
// admin.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminUploadService {
  private apiUrl = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  uploadCSV(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload-csv`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

// upload.component.ts
import { Component } from '@angular/core';
import { AdminUploadService } from './admin-upload.service';

@Component({
  selector: 'app-upload-csv',
  template: `
    <input type="file" #fileInput accept=".csv" />
    <button (click)="onUpload(fileInput)">Upload CSV</button>
  `
})
export class UploadCSVComponent {
  constructor(private uploadService: AdminUploadService) {}

  onUpload(fileInput: any) {
    const file = fileInput.files[0];
    if (file) {
      this.uploadService.uploadCSV(file, this.getToken()).subscribe(
        response => console.log('Sucesso!', response),
        error => console.error('Erro!', error)
      );
    }
  }

  private getToken(): string {
    // Obtenha do AuthService
    return localStorage.getItem('firebaseToken') || '';
  }
}
```

## Performance e Limites

- ✅ Suporta até **16.000+ registros** por upload
- ✅ Operações de bulkWrite (O(1))
- ✅ Parse streaming (baixo overhead de memória)
- ⚠️ Máximo recomendado: 50MB de arquivo CSV

## Segurança

- ✅ Protegido com `AdminGuard` + Firebase Auth
- ✅ Validação de token JWT em cada requisição
- ✅ Custom claims obrigatórios (`admin: true`)
- ✅ Sanitização de entrada (CSV parse seguro)
- ✅ Sem acesso a SQL (MongoDB Query Object)

## Próximos Passos (Sugestões)

1. Adicionar suporte a compressão (gzip) para arquivos grandes
2. Implementar webhook de notificação após conclusão
3. Criar histórico de uploads com auditoria
4. Adicionar preview do CSV antes de confirmar upload
5. Suportar formatos alternativos (Excel, Parquet)
