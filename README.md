# 🎯 TalentFC – O Guia Inteligente do Modo Carreira

**TalentFC** é um aplicativo mobile multiplataforma (Android e iOS) projetado especificamente para a comunidade global de entusiastas do Modo Carreira do EA Sports FC / FIFA. 

O objetivo do projeto é resolver uma dor crônica dos jogadores: a necessidade de pausar o gameplay para consultar bases de dados externas via navegador web (como o SoFIFA), lidando com interfaces lentas, excesso de anúncios intrusivos e filtros complexos em telas pequenas. O **TalentFC** consolida, otimiza e enriquece esses dados através de uma API própria ultra-rápida, entregando listas dinâmicas, ferramentas de busca inteligente e insights estratégicos direto no smartphone do usuário.

---

## 🚀 Funcionalidades Principais (Features)

Para se posicionar como a ferramenta de referência definitiva durante a gameplay, o aplicativo conta com os seguintes módulos estruturados:

### 1. Experiência Inicial e Globalização (Onboarding)
* **🌍 Seletor de Idiomas Nativo:** Interface simplificada na tela de login/boas-vindas com um menu visual (ícones de bandeiras: Brasil 🇧🇷, Espanha 🇪🇸 e Estados Unidos 🇺🇸) para seleção instantânea do idioma. Todo o aplicativo é traduzido dinamicamente em tempo real sem necessidade de reiniciar o app.

### 2. Curadorias e Listas Rápidas (Painel de Insights)
* **⭐ Favoritos & Shortlists:** Permite salvar jogadores de interesse em listas personalizadas para acompanhar sua evolução e valores de mercado ao longo das temporadas dentro do jogo.
* **📈 Top 10 Promessas (Wonderkids):** Listagem automatizada dos jogadores com a maior margem de crescimento do jogo (diferença entre o *Overall* atual e o *Potencial* máximo).
* **🔍 Hidden Gems (Jóias Escondidas):** Filtro focado em atletas desconhecidos de ligas periféricas que possuem baixo valor de mercado e salários baixos, mas alto potencial de evolução. Perfeito para times de divisões inferiores.
* **👴 Melhores Veteranos (Clube dos Trintões):** Jogadores experientes (30+ anos) com ótimos atributos físicos/técnicos residuais e que possuem características (*Traits*) de liderança, ideais para dar estabilidade imediata ao elenco.
* **🛡️ Categorias por Posição:** Filtros de um clique para listar os melhores talentos divididos estritamente por posições do ecossistema do futebol (Goleiros, Zagueiros, Laterais, Volantes, Meias, Pontas e Atacantes).

### 3. Módulos Avançados de Mercado e Scouting
* **⏳ Contratos Expirando (Pré-Contratos):** Uma aba dedicada a listar atletas cujos contratos na vida real/simulação estão nos últimos 6 meses, permitindo que o usuário os contrate sem custo de transferência na próxima janela.
* **👥 Sósias de Estilo de Jogo ("O Novo X"):** Sistema inteligente de recomendação baseado em Similaridade Vetorial. O usuário digita o nome de qualquer jogador (ativo ou lenda aposentada como "Zidane" ou "Ronaldinho"). O algoritmo cruza a distribuição de atributos físicos, técnicos e posições para sugerir atletas jovens, promissores e de baixo custo com estilo de jogo idêntico ao da referência informada.
* **💸 Team Builder & Calculadora de Orçamento:** O usuário insere o orçamento disponível do seu clube (ex: €30 milhões) e as posições que deseja preencher. O app gera a melhor combinação possível de contratações otimizando o valor restante.
* **📊 Alerta de Evolução Real-Time (Tracker):** Permite registrar o progresso de elenco de forma offline e comparar se as atualizações semanais de atributos feitas pela EA coincidem com a evolução do jogador na simulação.

### 4. Painel Administrativo (Gestão do App)
* **⚙️ Alternador de Ciclo/Versão:** Área restrita para o administrador alterar a versão ativa do jogo (ex: migrar do EA FC 26 para o EA FC 27). Essa alteração dita dinamicamente o parâmetro de versão que o Scraper utilizará na próxima varredura dominical.
* **🔐 Autenticação Segura:** Login administrativo integrado via **Firebase Auth**, garantindo agilidade na implementação e segurança robusta sem necessidade de gerenciar hashes de senha na API própria.

---

## 🛠️ Stack Tecnológica & Engenharia de Dados

O projeto foi arquitetado priorizando alta performance, escalabilidade, facilidade de manutenção a longo prazo e custo de infraestrutura próximo a zero nas fases iniciais.

### Frontend (Aplicativo Mobile)
* **Framework Principal:** **Ionic + Angular v22**
  * *Arquitetura Moderna:* Aproveita os recursos mais modernos de performance da plataforma, como a estabilização completa da arquitetura **Zoneless** (reduzindo o consumo de memória e otimizando a rolagem de listas infinitas) e o gerenciamento de estados reativos através de **Signals** nos formulários de filtros.
* **Internacionalização (i18n):** Integração de biblioteca via npm (`@ngx-translate/core` ou `@ngneat/transloco`) mapeando dicionários em JSON (`pt.json`, `es.json`, `en.json`) para consumo dinâmico e reativo baseado no idioma escolhido na UI.
* **Estilização:** **Tailwind CSS** para a construção de um layout moderno, responsivo, limpo e com suporte nativo a Dark Mode (essencial para quem joga à noite).
* **Distribuição:** **Capacitor**, permitindo manter uma única base de código em TypeScript/HTML que compila nativamente para pacotes oficiais de distribuição Android (`.aab`/`.apk`) e iOS (`.ipa`).

### Backend, Infraestrutura & Estratégia de Dados
* **API Framework:** **FastAPI (Python)** ou **NestJS (TypeScript)**. O backend gerencia o fluxo de entrega de dados limpos em formato JSON para o cliente.
* **Mecanismo de Sincronização (Scraper):** Um worker executando rotinas agendadas (*Cron Jobs*) de madrugada (horário de baixo tráfego). Ele lê as atualizações estruturais da versão ativa do jogo configurada pelo Admin, realiza a sanitização e popula o banco de dados. Os usuários consultam apenas os dados já estruturados na API, garantindo tempos de resposta na casa dos milissegundos.
* **Otimização de Mídia (Imagens e Fotos):** Para manter o banco de dados leve e evitar custos de armazenamento em nuvem, o aplicativo consome as fotos via link original (*hotlinking*). 
  * *Mecanismo de Resiliência:* O frontend Angular monitora falhas de carregamento através do evento `(error)` para injetar uma imagem genérica padrão caso a foto original esteja offline ou indefinida.
  * *Image Proxy Shield:* Para mitigar proteções de segurança de origem da fonte externa (Erros 403 / Referer Header), a API própria disponibiliza uma rota de proxy ultraleve que mascara a requisição da imagem e a repassa de forma limpa para o aplicativo móvel.
* **Banco de Dados (Poliglota) & Mecanismo de Busca:**
  * **MongoDB:** Armazenamento principal da volumosa coleção de dados dos jogadores ativos e da coleção `historical_legends` (banco de sementes estáticas de atletas aposentados/ícones usado como base para o algoritmo de sósias de estilo de jogo).
  * **PostgreSQL:** Banco relacional para gerenciar dados de usuários comuns, listas de favoritos, logs e a tabela de configurações globais (`app_settings`).
* **Orquestração:** **Docker** isolando todos os ambientes (bancos de dados, API e Workers) para garantir estabilidade absoluta do desenvolvimento à produção.

---

## 📐 Diretrizes de Desenvolvimento e Boas Práticas

Para manter o código-fonte limpo, escalável e de fácil entendimento por desenvolvedores e ferramentas de Inteligência Artificial, as seguintes regras arquiteturais devem ser seguidas:

1. **Tratamento de Erros Resiliente:** A comunicação do front-end com os serviços da API deve utilizar **Service-Level Error Handlers** (gerenciadores de erro a nível de serviço específico) em vez de interceptors globais genéricos. Isso garante o tratamento isolado de falhas de rede sem quebrar fluxos concorrentes do aplicativo.
2. **Transformações de Dados Imutáveis:** No processamento de listas de jogadores dentro do app, rotinas de filtragem complexas (por país, idade ou times) devem utilizar obrigatoriamente métodos imutáveis como `.filter()` em vez de `.find()`. Isso é imperativo, pois múltiplos jogadores compartilham os mesmos identificadores contextuais (como a mesma nacionalidade ou faixa de preço), exigindo o retorno completo das coleções correspondentes.
3. **Performance UI:** Componentes de listas de jogadores devem implementar padrões de *Virtual Scroll* (rolagem virtual) nativos do ecossistema Ionic/Angular para renderizar no DOM apenas os elements visíveis na tela, mitigando gargalos de desempenho em aparelhos mais antigos.

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
│   ├── src/                # Endpoints, lógica de negócios, algoritmo de sósias e proxy de imagens
│   ├── scraper/            # Worker de sincronização guiado pela tabela app_settings
│   ├── Dockerfile          # Configuração do container do backend
│   └── requirements.txt    # Dependências do backend
├── frontend/               # Aplicativo Mobile (Ionic + Angular v22)
│   ├── src/                # Componentes, Serviços (i18n + Firebase), Assets (pt/es/en.json) e Tailwind
│   ├── capacitor.config.ts # Configuração de ponta para Android/iOS e AdMob
│   ├── package.json        # Módulos do ecossistema Angular
│   └── Tailwind.config.js  # Tokens de design do app
├── docker-compose.yml      # Orquestração local do ambiente completo (App + Postgres + Mongo)
└── README.md               # Este arquivo de documentação complementar
