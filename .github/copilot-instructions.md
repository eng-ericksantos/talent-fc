# Contexto do Projeto: TalentFC
Aplicativo mobile multiplataforma (Android/iOS) focado no Modo Carreira do EA FC. 
Stack Front-end: Angular v22, Ionic/Capacitor, Tailwind CSS, TypeScript. 
Ecossistema complementar: Backend em Python/FastAPI ou NestJS, bancos MongoDB/PostgreSQL e workers de web scraping.

# Regras Arquiteturais Inegociáveis (Strict Rules)

1.  **Arquitetura Angular Moderna:**
    * Obrigatório o uso de Angular v22 em modo **Zoneless** completo. Não utilize `zone.js`.
    * Todo o gerenciamento de estado, reatividade e controle de formulários deve ser feito estritamente utilizando **Signals** (`signal`, `computed`, `effect`).

2.  **Tratamento de Erros e Comunicação:**
    * **Nunca** utilize Interceptors globais para tratamento de falhas HTTP. 
    * Implemente a captura e tratativa de erros exclusivamente através de gerenciadores a nível de serviço (Service-Level Error Handlers) para manter o isolamento de domínios e prevenir conflitos arquiteturais futuros.

3.  **Manipulação de Dados e Arrays:**
    * Sempre utilize métodos imutáveis para transformação de dados.
    * Para buscar ou filtrar listas (ex: jogadores com a mesma nacionalidade, preço ou atributos), **utilize obrigatoriamente o método `.filter()` no lugar de `.find()`**. Como o projeto lida com dados em massa que compartilham os mesmos identificadores contextuais, a coleção completa deve ser sempre retornada.

4.  **Estilização e UI:**
    * Uso exclusivo de **Tailwind CSS**. Não crie arquivos `.css` ou `.scss` separados a nível de componente a menos que seja estritamente necessário para animações complexas não suportadas pelo Tailwind.
    * Mantenha fidelidade à paleta padrão do projeto: `soccerDark` (#0f172a), `soccerGreen` (#10b981), `soccerCard` (#1e293b).

5.  **Infraestrutura Integrada:**
    * Todos os serviços construídos devem possuir orquestração via **Docker** desde a primeira versão para garantir estabilidade absoluta do ambiente de desenvolvimento à produção.

6.  **Geração de Código da IA:**
    * Responda de forma concisa. Foque no código requisitado sem explicações redundantes ou tutoriais longos.
    * Mantenha nomes de variáveis, métodos e classes em português. Sempre utilize a tradução do i18n (`pt.json, en.json, es.json`) evite criar textos estáticos diretamente no código.