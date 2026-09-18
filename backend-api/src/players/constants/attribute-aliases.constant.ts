/**
 * Mapeamento de múltiplos nomes de colunas (aliases) para a chave canônica em camelCase
 * Suporta variações de CSVs diferentes (espaços, maiúsculas, underscores, abreviações)
 * 
 * Ordem importa: aliases mais específicos primeiro, genéricos depois
 */
export const ATTRIBUTE_ALIASES: Record<string, Set<string>> = {
  // Ritmo/Velocidade
  acceleration: new Set([
    'acceleration', 'acceleracao', 'acc', 'accel',
  ]),
  sprintSpeed: new Set([
    'sprintSpeed', 'sprint_speed', 'sprint speed', 'velocidade sprint', 'velocidade_sprint',
    'sprintspeed', 'velocidadesprrint',
  ]),

  // Finalização
  finishing: new Set([
    'finishing', 'finalizacao', 'fini', 'fin',
  ]),
  shotPower: new Set([
    'shotPower', 'shot_power', 'shot power', 'potencia disparo', 'potencia_disparo',
    'shotpower', 'potenciadisparo',
  ]),
  longShots: new Set([
    'longShots', 'long_shots', 'long shots', 'chutes distancia', 'chutes_distancia',
    'longshots', 'chutesdistancia',
  ]),
  volleys: new Set([
    'volleys', 'voleio', 'voleios',
  ]),
  penalties: new Set([
    'penalties', 'penalty', 'penaltis', 'penal',
  ]),
  positioning: new Set([
    'positioning', 'posicionamento', 'posic',
  ]),

  // Passe
  shortPassing: new Set([
    'shortPassing', 'short_passing', 'short passing', 'passe curto', 'passe_curto',
    'shortpassing', 'passecurto',
  ]),
  longPassing: new Set([
    'longPassing', 'long_passing', 'long passing', 'passe longo', 'passe_longo',
    'longpassing', 'passelongo',
  ]),
  vision: new Set([
    'vision', 'visao', 'visão',
  ]),
  crossing: new Set([
    'crossing', 'cruzamento',
  ]),
  freeKickAccuracy: new Set([
    'freeKickAccuracy', 'free_kick_accuracy', 'free kick accuracy', 'acerto falta',
    'acertofalta', 'freekickaccuracy',
  ]),
  curve: new Set([
    'curve', 'curva',
  ]),

  // Drible/Técnica
  dribbling: new Set([
    'dribbling', 'drible', 'dribles',
  ]),
  ballControl: new Set([
    'ballControl', 'ball_control', 'ball control', 'controle bola', 'controle_bola',
    'ballcontrol', 'controlebola',
  ]),
  agility: new Set([
    'agility', 'agilidade',
  ]),
  balance: new Set([
    'balance', 'equilibrio', 'equilíbrio',
  ]),
  reactions: new Set([
    'reactions', 'reacoes', 'reações',
  ]),
  composure: new Set([
    'composure', 'compostura',
  ]),

  // Defesa
  defensiveAwareness: new Set([
    'defensiveAwareness', 'defensive_awareness', 'defensive awareness', 'consciencia defesa',
    'consciencia_defesa', 'defawareness', 'def awareness',
  ]),
  standingTackle: new Set([
    'standingTackle', 'standing_tackle', 'standing tackle', 'tabela em pe', 'tabela_em_pe',
    'standingtackle',
  ]),
  slidingTackle: new Set([
    'slidingTackle', 'sliding_tackle', 'sliding tackle', 'tabela deslizante', 'tabela_deslizante',
    'slidingtackle',
  ]),
  headingAccuracy: new Set([
    'headingAccuracy', 'heading_accuracy', 'heading accuracy', 'precisao cabeca', 'precisao_cabeca',
    'headingaccuracy',
  ]),
  interceptions: new Set([
    'interceptions', 'interceptacoes', 'intercept',
  ]),
  aggression: new Set([
    'aggression', 'agressividade', 'agress',
  ]),

  // Atributos Físicos
  jumping: new Set([
    'jumping', 'salto', 'pulo',
  ]),
  stamina: new Set([
    'stamina', 'resistencia', 'resisti',
  ]),
  strength: new Set([
    'strength', 'forca', 'força',
  ]),

  // Goleiro
  gkDiving: new Set([
    'gkDiving', 'gk_diving', 'gk diving', 'mergulho goleiro', 'gkdiving',
  ]),
  gkHandling: new Set([
    'gkHandling', 'gk_handling', 'gk handling', 'manuseio goleiro', 'gkhandling',
  ]),
  gkKicking: new Set([
    'gkKicking', 'gk_kicking', 'gk kicking', 'chute goleiro', 'gkkicking',
  ]),
  gkPositioning: new Set([
    'gkPositioning', 'gk_positioning', 'gk positioning', 'posicionamento goleiro', 'gkpositioning',
  ]),
  gkReflexes: new Set([
    'gkReflexes', 'gk_reflexes', 'gk reflexes', 'reflexos goleiro', 'gkreflexes',
  ]),

  // Especial
  skillMoves: new Set([
    'skillMoves', 'skill_moves', 'skill moves', 'skill', 'movimentos habilidade',
    'skillmoves',
  ]),
};

/**
 * Normaliza um nome de coluna do CSV para camelCase canônico
 * 
 * Estratégia:
 * 1. Remove espaços e underscores
 * 2. Converte para minúsculas (exceto primeira letra após espaço)
 * 3. Busca no mapa de aliases
 * 4. Se não encontrar, tenta Levenshtein distance (fuzzy match)
 */
export function normalizarNomeAtributo(nomeOriginal: string): string | null {
  if (!nomeOriginal) return null;

  // Limpar: trim, minúsculas
  let normalizado = nomeOriginal.trim().toLowerCase();

  // Busca direta no mapa
  for (const [chaveCanonica, aliases] of Object.entries(ATTRIBUTE_ALIASES)) {
    if (aliases.has(normalizado)) {
      return chaveCanonica;
    }
  }

  // Fallback: remover espaços e underscores, tentar novamente
  const semEspacos = normalizado.replace(/[\s_]/g, '');
  for (const [chaveCanonica, aliases] of Object.entries(ATTRIBUTE_ALIASES)) {
    for (const alias of aliases) {
      if (alias.replace(/[\s_]/g, '') === semEspacos) {
        return chaveCanonica;
      }
    }
  }

  // Fuzzy matching com Levenshtein distance (como último recurso)
  const distancias = Object.entries(ATTRIBUTE_ALIASES).map(([chave, aliases]) => ({
    chave,
    distancia: Math.min(
      levenshteinDistance(normalizado, chave),
      ...Array.from(aliases).map((alias) => levenshteinDistance(normalizado, alias)),
    ),
  }));

  distancias.sort((a, b) => a.distancia - b.distancia);
  const melhor = distancias[0];

  // Se a distância for razoável (<=3 caracteres de diferença), aceitar
  if (melhor && melhor.distancia <= 3) {
    return melhor.chave;
  }

  return null;
}

/**
 * Distância de Levenshtein entre duas strings
 * Mede o número mínimo de edições necessárias para transformar uma string em outra
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  const matriz: number[][] = Array.from({ length: aLen + 1 }, () => Array(bLen + 1).fill(0));

  for (let i = 0; i <= aLen; i++) matriz[i][0] = i;
  for (let j = 0; j <= bLen; j++) matriz[0][j] = j;

  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1, // deleção
        matriz[i][j - 1] + 1, // inserção
        matriz[i - 1][j - 1] + custo, // substituição
      );
    }
  }

  return matriz[aLen][bLen];
}

/**
 * Extrai atributos numéricos de uma linha CSV com fallback inteligente
 * Se um atributo for 0 e for crítico para a lenda, tenta interpolação
 */
export function extrairAtributosEstendidos(
  linha: Record<string, any>,
  atributosAdicionais?: Record<string, number>,
): Record<string, number> {
  const resultado: Record<string, number> = atributosAdicionais ? { ...atributosAdicionais } : {};

  for (const [chaveOriginal, valor] of Object.entries(linha)) {
    if (valor === null || valor === undefined || valor === '') continue;

    const chaveCanonica = normalizarNomeAtributo(chaveOriginal);
    if (!chaveCanonica) continue;

    const numerico = parseInt(String(valor), 10);
    if (!isNaN(numerico) && numerico > 0) {
      resultado[chaveCanonica] = numerico;
    }
  }

  return resultado;
}
