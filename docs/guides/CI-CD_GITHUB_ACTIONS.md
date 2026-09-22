# CI/CD: Build APK no GitHub Actions (Tarefa 52)

## 📋 Checklist Pré-Requisitos

Antes de executar a ação do GitHub Actions para compilar o APK, verifique os seguintes itens:

### ✅ Configuração do Capacitor

#### 1. **capacitor.config.ts** (Frontend)
Deve estar configurado assim:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.talentfc.app',      // ✅ ID único do app (com.empresa.app)
  appName: 'TalentFC',             // ✅ Nome visível do app
  webDir: 'www',                    // ✅ Diretório de build Angular
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
```

**Status:** ✅ Configurado e pronto

---

### ✅ Dependências do Frontend

#### 2. **package.json** (Frontend)
Verifique se contém:
```json
{
  "scripts": {
    "build": "ng build",
    "start": "ng serve"
  },
  "dependencies": {
    "@capacitor/android": "^8.0.0",
    "@capacitor/core": "^8.0.0",
    "@capacitor/cli": "^8.0.0"
  }
}
```

**Verificar com:** `cd frontend && npm list @capacitor/core`

---

### ✅ Plataforma Android Adicionada

#### 3. **Adicionar Android Platform (Se necessário)**

Se a plataforma Android ainda não foi adicionada, execute:

```bash
cd frontend
npx cap add android
```

**Confirmação:** Deve haver pasta `frontend/android/` com:
```
frontend/android/
├── app/
├── gradle/
├── gradlew
├── gradlew.bat
├── settings.gradle
└── build.gradle
```

---

### ✅ Variáveis de Ambiente

#### 4. **.env no Frontend**

Crie um arquivo `.env` (ou `.env.local`) com as configurações necessárias:

```bash
# frontend/.env.production
FIREBASE_API_KEY=your_key_here
FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
# ... outras variáveis necessárias
```

**Nota:** Será ignorado pelo .gitignore (não é commitado)

---

## 🚀 Como Executar a Ação

### 1. **Via GitHub Web UI**
- Acesse: `https://github.com/seu-usuario/talent-fc/actions`
- Clique em "Build APK do TalentFC"
- Clique em "Run workflow"
- Selecione a branch (main)
- Clique em "Run workflow"

### 2. **Tempo de Execução**
Esperado: **10-15 minutos**
- Node.js setup: ~1 min
- npm install: ~3 min
- Angular build: ~3-5 min
- Java setup: ~2 min
- Gradle build: ~5-10 min

### 3. **Saída de Sucesso**
```
✅ APK compilado e disponível para download!
```

Acesse "Artifacts" para baixar o arquivo `TalentFC-APK.zip`

---

## 📦 Download do APK

Após o workflow ser concluído com sucesso:

1. Acesse a aba **Actions**
2. Clique no workflow executado
3. Procure por **Artifacts**
4. Clique em **TalentFC-APK** para baixar

O arquivo extraído será: `app-debug.apk`

---

## ❌ Troubleshooting

### Erro: "Gradle build failed"
**Solução:** Verifique se `frontend/android/` existe e `gradlew` tem permissão
```bash
ls -la frontend/android/gradlew
chmod +x frontend/android/gradlew
```

### Erro: "Cannot find module '@capacitor/core'"
**Solução:** Execute no frontend:
```bash
npm install
npx cap sync android
```

### Erro: "webDir 'www' does not exist"
**Solução:** Verifique se o build Angular foi bem-sucedido
```bash
cd frontend
npm run build
ls -la www/
```

### Erro: "Java 17 not found"
**Solução:** Automático na ação (usa zulu distribution). Se rodar localmente:
```bash
java -version
# Versão mínima: Java 11
```

---

## 🔧 Variáveis Configuráveis

No arquivo `.github/workflows/build-apk.yml`, você pode ajustar:

```yaml
node-version: '20'              # Versão do Node.js
java-version: '17'             # Versão do Java
distribution: 'zulu'           # Distribuição Java
retention-days: 30             # Dias de retenção do artefato
cache: 'npm'                    # Cache de dependências
```

---

## 📝 Logs de Construção

Para debug, acesse o workflow e verifique:

1. **Checkout:** Clonagem do repo
2. **Setup:** Node.js e Java
3. **Install:** npm install
4. **Build:** ng build
5. **Capacitor:** Sincronização
6. **Gradle:** ./gradlew assembleDebug

Cada step mostra stdout/stderr completo.

---

## ✨ Status Atual

| Componente | Status | Versão |
|---|---|---|
| Capacitor Config | ✅ Pronto | config.ts |
| Workflow YAML | ✅ Pronto | build-apk.yml |
| Node.js | ✅ v20 | package.json |
| Java | ✅ v17 | zulu |
| Android Platform | ⏳ Verificar | frontend/android/ |

---

## 📌 Próximos Passos

1. ✅ **Agora:** Verificar Android Platform está adicionado
2. ✅ **Depois:** Commit das mudanças de config
3. ✅ **Por fim:** Rodar workflow manualmente via GitHub Actions

```bash
# Commit das mudanças
git add .github/workflows/build-apk.yml frontend/capacitor.config.ts
git commit -m "ci: add github actions workflow for apk build"
git push
```

Então acesse GitHub Actions para disparar manualmente! 🚀
