# 🎯 TalentFC – O Guia Inteligente do Modo Carreira

**TalentFC** é um aplicativo mobile multiplataforma (Android e iOS) projetado especificamente para a comunidade global de entusiastas do Modo Carreira do EA Sports FC / FIFA. 

O objetivo do projeto é resolver uma dor crônica dos jogadores: a necessidade de pausar o gameplay para consultar bases de dados externas via navegador web (como o SoFIFA), lidando com interfaces lentas, excesso de anúncios intrusivos e filtros complexos em telas pequenas. O **TalentFC** consolida, otimiza e enriquece esses dados através de uma API própria ultra-rápida, entregando listas dinâmicas, ferramentas de busca inteligente e insights estratégicos direto no smartphone do usuário.

---

## 🚀 Funcionalidades Principais (Features)

Para se posicionar como a ferramenta de referência definitiva durante a gameplay, o aplicativo conta com os seguintes módulos estruturados:

### 1. Curadorias e Listas Rápidas (Painel de Insights)
* **⭐ Favoritos & Shortlists:** Permite salvar jogadores de interesse em listas personalizadas para acompanhar sua evolução e valores de mercado ao longo das temporadas dentro do jogo.
* **📈 Top 10 Promessas (Wonderkids):** Listagem automatizada dos jogadores com a maior margem de crescimento do jogo (diferença entre o *Overall* atual e o *Potencial* máximo).
* **🔍 Hidden Gems (Jóias Escondidas):** Filtro focado em atletas desconhecidos de ligas periféricas que possuem baixo valor de mercado e salários baixos, mas alto potencial de evolução. Perfeito para times de divisões inferiores.
* **👴 Melhores Veteranos (Clube dos Trintões):** Jogadores experientes (30+ anos) com ótimos atributos físicos/técnicos residuais e que possuem características (*Traits*) de liderança, ideais para dar estabilidade imediata ao elenco.
* **🛡️ Categorias por Posição:** Filtros de um clique para listar os melhores talentos divididos estritamente por posições do ecossistema do futebol (Goleiros, Zagueiros, Laterais, Volantes, Meias, Pontas e Atacantes).

### 2. Módulos Avançados de Mercado e Scouting
* **⏳ Contratos Expirando (Pré-Contratos):** Uma aba dedicada a listar atletas cujos contratos na vida real/simulação estão nos últimos 6 meses, permitindo que o usuário os contrate sem custo de transferência na próxima janela.
* **👥 Sósias de Estilo de Jogo ("O Novo X"):** Um algoritmo inteligente de recomendação. Caso o usuário queira um supercraque (ex: Haaland ou De Bruyne), mas não tenha orçamento, o app analisa a distribuição de atributos físicos e técnicos para sugerir alternativas acessíveis e idênticas em estilo de jogo.
* **💸 Team Builder & Calculadora de Orçamento:** O usuário insere o orçamento disponível do seu clube (ex: €30 milhões) e as posições que deseja preencher. O app gera a melhor combinação possível de contratações otimizando o valor restante.
* **📊 Alerta de Evolução Real-Time (Tracker):** Permite registrar o progresso de elenco de forma offline e comparar se as atualizações semanais de atributos feitas pela EA coincidem com a evolução do jogador na simulação.

---

## 🛠️ Stack Tecnológica

O projeto foi arquitetado priorizando alta performance, escalabilidade, facilidade de manutenção a longo prazo e custo de infraestrutura próximo a zero nas fases iniciais.

### Frontend (Aplicativo Mobile)
* **Framework Principal:** **Ionic + Angular v22**
  * *Arquitetura Moderna:* Aproveita os recursos mais modernos de performance da plataforma, como a estabilização completa da arquitetura **Zoneless** (reduzindo o consumo de memória e otimizando a rolagem de listas infinitas) e o gerenciamento de estados reativos através de **Signals** nos formulários de filtros.
* **Estilização:** **Tailwind CSS** para a construção de um layout moderno, responsivo, limpo e com suporte nativo a Dark Mode (essencial para quem joga à noite).
* **Distribuição:** **Capacitor**, permitindo manter uma única base de código em TypeScript/HTML que compila nativamente para pacotes oficiais de distribuição Android (`.aab`/`.apk`) e iOS (`.ipa`).

### Backend & Engenharia de Dados
* **API Framework:** **FastAPI (Python)** ou **NestJS (TypeScript)**. O backend gerencia o fluxo de entrega de dados limpos em formato JSON para o cliente.
* **Mecanismo de Sincronização (Scraper):** Um worker executando rotinas agendadas (*Cron Jobs*) em horários de baixo acesso. Ele lê as atualizações estruturais da fonte externa, realiza a sanitização dos dados e evita requisições em tempo real do usuário à fonte externa, blindando o servidor contra bloqueios de IP.
* **Banco de Dados (Poliglota):**
  * **MongoDB:** Armazenamento principal da volumosa coleção de dados dos jogadores indexados em documentos JSON (atributos, caminhos de imagens, históricos).
  * **PostgreSQL:** Banco relacional para gerenciar com segurança os dados de usuários cadastrados, configurações globais e listas de favoritos.
* **Orquestração:** **Docker** isolando todos os ambientes (bancos de dados, API e Workers) para garantir estabilidade absoluta do ambiente de desenvolvimento à produção.

---

## 📐 Diretrizes de Desenvolvimento e Boas Práticas

Para manter o código-fonte limpo, escalável e de fácil entendimento por desenvolvedores e ferramentas de Inteligência Artificial, as seguintes regras arquiteturais devem ser seguidas:

1. **Tratamento de Erros Resiliente:** A comunicação do front-end com os serviços da API deve utilizar **Service-Level Error Handlers** (gerenciadores de erro a nível de serviço específico) em vez de interceptors globais genéricos. Isso garante o tratamento isolado de falhas de rede sem quebrar fluxos concorrentes do aplicativo.
2. **Transformações de Dados Imutáveis:** No processamento de listas de jogadores dentro do app, rotinas de filtragem complexas (por país, idade ou times) devem utilizar obrigatoriamente métodos imutáveis como `.filter()` em vez de `.find()`. Isso é imperativo, pois múltiplos jogadores compartilham os mesmos identificadores contextuais (como a mesma nacionalidade ou faixa de preço), exigindo o retorno completo das coleções correspondentes.
3. **Performance UI:** Componentes de listas de jogadores devem implementar padrões de *Virtual Scroll* (rolagem virtual) nativos do ecossistema Ionic/Angular para renderizar no DOM apenas os elementos visíveis na tela, mitigando gargalos de desempenho em aparelhos mais antigos.

---

## 💰 Estratégia de Monetização e UX

O aplicativo foi projetado para gerar receita sustentável através da plataforma **Google AdMob**, integrada via plugin nativo do Capacitor (`@capacitor-community/admob`), balanceando monetização e experiência do usuário (UX):

* **Anúncios de Banner:** Fixados discretamente no rodapé das telas de listagem de jogadores, sem interferir na leitura dos atributos de velocidade, drible ou chute.
* **Vídeos Premiados (Rewarded Videos):** Utilizados de forma estratégica e não obrigatória. O usuário pode optar por assistir a um anúncio em vídeo curto de 15 segundos para desbloquear ferramentas avançadas por tempo determinado, como o módulo *Sósias de Estilo de Jogo ("O Novo X")* ou a *Calculadora de Orçamento*. Isso maximiza o eCPM (ganho por mil impressões) sem frustrar o fluxo natural do jogador.

---

## 📂 Estrutura Sugerida do Repositório

```text
├── .github/                # Configurações de CI/CD e templates
├── backend/                # Código do servidor API e scripts de extração (Python/NestJS)
│   ├── src/                # Endpoints e lógica de negócios
│   ├── scraper/            # Worker de sincronização com o banco de dados
│   ├── Dockerfile          # Configuração do container do backend
│   └── requirements.txt    # Dependências do backend
├── frontend/               # Aplicativo Mobile (Ionic + Angular v22)
│   ├── src/                # Componentes, Serviços e Views com Tailwind
│   ├── capacitor.config.ts # Configuração de ponta para Android/iOS e AdMob
│   ├── package.json        # Módulos do ecossistema Angular
│   └── Tailwind.config.js  # Tokens de design do app
├── docker-compose.yml      # Orquestração local do ambiente completo
└── README.md               # Este arquivo de documentação complementar
