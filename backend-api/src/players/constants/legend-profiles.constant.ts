// Perfis estatísticos-base do "Modo Herdeiros da Lenda". Cada chave é o termo de busca
// (minúsculo, sem acentos) e aponta para os critérios de similaridade daquela lenda no FC 26.
export interface PerfilLenda {
  nome: string;
  positions: string[];
  maxAge?: number;
  skillMoves?: number;
  minVision?: number;
  minShortPassing?: number;
  minLongPassing?: number;
  minBallControl?: number;
  minComposure?: number;
  minDribbling?: number;
  minAgility?: number;
  minStamina?: number;
  minInterceptions?: number;
  minDefensiveAwareness?: number;
  minStandingTackle?: number;
  minSlidingTackle?: number;
  minPace?: number;
  minSprintSpeed?: number;
  minAcceleration?: number;
  minFinishing?: number;
  minShotPower?: number;
  minLongShots?: number;
  minCrossing?: number;
  minHeadingAccuracy?: number;
  minStrength?: number;
  minReactions?: number;
  minBalance?: number;
  minJumping?: number;
  minPenalties?: number;
  minCurve?: number;
  minFreeKickAccuracy?: number;
  minPositioning?: number;
  minVolleys?: number;
  minAggression?: number;
  minGkReflexes?: number;
  minGkDiving?: number;
  minGkHandling?: number;
  minGkPositioning?: number;
  minGkKicking?: number;
}

// Traduz o nome de um campo do perfil (ex: "minShortPassing") para a chave crua da EA (ex: "shortPassing")
export function normalizarCampoPerfil(chave: string): string {
  if (chave === 'skillMoves') return 'skillMoves';
  const semPrefixo = chave.slice(3);
  return semPrefixo.charAt(0).toLowerCase() + semPrefixo.slice(1);
}

// Atributos que vivem em locais especiais do documento — os demais caem em atributosEstendidos.<chave>
const CAMPO_PARA_CAMINHO: Record<string, string> = {
  vision: 'atributos.visao',
  shortPassing: 'atributos.passe_curto',
  ballControl: 'atributos.controle_bola',
  composure: 'atributos.compostura',
  dribbling: 'atributos.drible',
  agility: 'atributos.agilidade',
  stamina: 'resistencia',
  interceptions: 'interceptacoes',
  pace: 'ritmo',
  skillMoves: 'habilidades',
};

/**
 * Caminhos alternativos (fallback) para atributos que podem estar em locais diferentes
 * Útil quando importações antigas não salvaram os atributos no lugar correto
 * 
 * Exemplo: sprintSpeed pode estar em:
 *   1. atributosEstendidos.sprintSpeed (novo)
 *   2. atributosEstendidos.sprint_speed (variação)
 *   3. ritmo (antiga normalização incorreta)
 */
const CAMPO_PARA_CAMINHO_FALLBACK: Record<string, string[]> = {
  dribbling: ['atributosEstendidos.dribbling', 'atributosEstendidos.drible', 'atributos.drible'],
  sprintSpeed: ['atributosEstendidos.sprintSpeed', 'atributosEstendidos.sprint_speed', 'ritmo'],
  longShots: ['atributosEstendidos.longShots', 'atributosEstendidos.long_shots'],
  shotPower: ['atributosEstendidos.shotPower', 'atributosEstendidos.shot_power'],
  volleys: ['atributosEstendidos.volleys'],
  penalties: ['atributosEstendidos.penalties'],
  positioning: ['atributosEstendidos.positioning'],
  longPassing: ['atributosEstendidos.longPassing', 'atributosEstendidos.long_passing'],
  freeKickAccuracy: ['atributosEstendidos.freeKickAccuracy', 'atributosEstendidos.free_kick_accuracy'],
  curve: ['atributosEstendidos.curve'],
  defensiveAwareness: ['atributosEstendidos.defensiveAwareness', 'atributosEstendidos.defensive_awareness'],
  standingTackle: ['atributosEstendidos.standingTackle', 'atributosEstendidos.standing_tackle'],
  slidingTackle: ['atributosEstendidos.slidingTackle', 'atributosEstendidos.sliding_tackle'],
  headingAccuracy: ['atributosEstendidos.headingAccuracy', 'atributosEstendidos.heading_accuracy'],
  aggression: ['atributosEstendidos.aggression'],
  jumping: ['atributosEstendidos.jumping'],
  strength: ['atributosEstendidos.strength'],
  gkDiving: ['atributosEstendidos.gkDiving', 'atributosEstendidos.gk_diving'],
  gkHandling: ['atributosEstendidos.gkHandling', 'atributosEstendidos.gk_handling'],
  gkKicking: ['atributosEstendidos.gkKicking', 'atributosEstendidos.gk_kicking'],
  gkPositioning: ['atributosEstendidos.gkPositioning', 'atributosEstendidos.gk_positioning'],
  gkReflexes: ['atributosEstendidos.gkReflexes', 'atributosEstendidos.gk_reflexes'],
  acceleration: ['atributosEstendidos.acceleration'],
  finishing: ['atributosEstendidos.finishing'],
  crossing: ['atributosEstendidos.crossing'],
};

export function resolverCaminhoAtributo(campo: string): string {
  return CAMPO_PARA_CAMINHO[campo] ?? `atributosEstendidos.${campo}`;
}

/**
 * Resolve todos os caminhos possíveis para um atributo (primário + fallbacks)
 */
export function resolverTodosCaminhos(campo: string): string[] {
  const caminhosPrimario = [resolverCaminhoAtributo(campo)];
  const caminhosFallback = CAMPO_PARA_CAMINHO_FALLBACK[campo] || [];
  return [...caminhosPrimario, ...caminhosFallback];
}

export const LEGEND_PROFILES: Record<string, PerfilLenda> = {
  // Goleiros
  yashin: { nome: 'Lev Yashin', positions: ['GK'], minGkReflexes: 88, minGkDiving: 87, minGkHandling: 86, minGkPositioning: 88 },
  buffon: { nome: 'Gianluigi Buffon', positions: ['GK'], minGkReflexes: 89, minGkDiving: 87, minGkHandling: 87, minGkPositioning: 89 },
  casillas: { nome: 'Iker Casillas', positions: ['GK'], minGkReflexes: 89, minGkDiving: 86, minGkHandling: 85, minGkPositioning: 86 },
  kahn: { nome: 'Oliver Kahn', positions: ['GK'], minGkReflexes: 87, minGkDiving: 89, minGkHandling: 88, minGkPositioning: 87 },
  zoff: { nome: 'Dino Zoff', positions: ['GK'], minGkReflexes: 86, minGkDiving: 85, minGkHandling: 85, minGkPositioning: 87 },
  schmeichel: { nome: 'Peter Schmeichel', positions: ['GK'], minGkReflexes: 88, minGkDiving: 87, minGkHandling: 86, minGkPositioning: 86 },
  neuer: { nome: 'Manuel Neuer', positions: ['GK'], minGkReflexes: 89, minGkDiving: 86, minGkHandling: 87, minGkPositioning: 89, minGkKicking: 85 },
  alisson: { nome: 'Alisson', positions: ['GK'], minGkReflexes: 88, minGkDiving: 86, minGkHandling: 86, minGkPositioning: 87, minGkKicking: 84 },
  ederson: { nome: 'Ederson', positions: ['GK'], minGkReflexes: 86, minGkDiving: 84, minGkHandling: 85, minGkPositioning: 85, minGkKicking: 89 },
  oblak: { nome: 'Jan Oblak', positions: ['GK'], minGkReflexes: 90, minGkDiving: 88, minGkHandling: 87, minGkPositioning: 88 },

  // Zagueiros
  maldini: { nome: 'Paolo Maldini', positions: ['CB', 'LB'], minDefensiveAwareness: 86, minInterceptions: 85, minStandingTackle: 85 },
  beckenbauer: { nome: 'Franz Beckenbauer', positions: ['CB'], minDefensiveAwareness: 87, minShortPassing: 84, minComposure: 87 },
  baresi: { nome: 'Franco Baresi', positions: ['CB'], minDefensiveAwareness: 88, minStandingTackle: 87, minInterceptions: 86 },
  nesta: { nome: 'Alessandro Nesta', positions: ['CB'], minDefensiveAwareness: 88, minStandingTackle: 86, minSlidingTackle: 85 },
  cannavaro: { nome: 'Fabio Cannavaro', positions: ['CB'], minDefensiveAwareness: 87, minStandingTackle: 87, minInterceptions: 85, minStrength: 80 },
  thiagosilva: { nome: 'Thiago Silva', positions: ['CB'], minDefensiveAwareness: 87, minInterceptions: 86, minReactions: 86 },
  puyol: { nome: 'Carles Puyol', positions: ['CB'], minDefensiveAwareness: 86, minStandingTackle: 87, minAggression: 86, minStrength: 84 },
  vandijk: { nome: 'Virgil van Dijk', positions: ['CB'], minDefensiveAwareness: 88, minHeadingAccuracy: 85, minStrength: 87, minReactions: 87 },
  moore: { nome: 'Bobby Moore', positions: ['CB'], minDefensiveAwareness: 85, minInterceptions: 86, minComposure: 85 },
  passarella: { nome: 'Daniel Passarella', positions: ['CB'], minDefensiveAwareness: 85, minHeadingAccuracy: 84, minAggression: 85 },
  ramos: { nome: 'Sergio Ramos', positions: ['CB'], minDefensiveAwareness: 86, minHeadingAccuracy: 86, minAggression: 87, minStandingTackle: 85 },
  pique: { nome: 'Gerard Piqué', positions: ['CB'], minDefensiveAwareness: 85, minShortPassing: 82, minHeadingAccuracy: 84 },
  koeman: { nome: 'Ronald Koeman', positions: ['CB'], minDefensiveAwareness: 83, minLongPassing: 85, minFreeKickAccuracy: 86 },
  stam: { nome: 'Jaap Stam', positions: ['CB'], minDefensiveAwareness: 87, minStandingTackle: 87, minStrength: 87 },

  // Laterais
  cafu: { nome: 'Cafu', positions: ['RB'], minSprintSpeed: 88, minStamina: 88, minCrossing: 83, minStandingTackle: 82 },
  robertocarlos: { nome: 'Roberto Carlos', positions: ['LB'], minSprintSpeed: 89, minShotPower: 90, minFreeKickAccuracy: 85, minCrossing: 83 },
  danialves: { nome: 'Dani Alves', positions: ['RB'], minSprintSpeed: 86, minCrossing: 85, minStamina: 87, minStandingTackle: 82 },
  marcelo: { nome: 'Marcelo', positions: ['LB'], minDribbling: 86, minAgility: 87, minCrossing: 84, minSprintSpeed: 85 },
  lahm: { nome: 'Philipp Lahm', positions: ['RB', 'CDM'], minShortPassing: 85, minStandingTackle: 84, minReactions: 86 },
  facchetti: { nome: 'Giacinto Facchetti', positions: ['LB'], minDefensiveAwareness: 84, minHeadingAccuracy: 82, minStamina: 85 },
  maicon: { nome: 'Maicon', positions: ['RB'], minSprintSpeed: 88, minShotPower: 86, minCrossing: 84 },
  evra: { nome: 'Patrice Evra', positions: ['LB'], minSprintSpeed: 86, minStandingTackle: 85, minStamina: 86 },
  zanetti: { nome: 'Javier Zanetti', positions: ['RB'], minStamina: 88, minStandingTackle: 85, minInterceptions: 84 },
  carlosalberto: { nome: 'Carlos Alberto', positions: ['RB'], minSprintSpeed: 86, minCrossing: 84, minShotPower: 85 },

  // Volantes
  kante: { nome: 'N\'Golo Kanté', positions: ['CDM', 'CM'], minStamina: 90, minInterceptions: 85, maxAge: 23 },
  makelele: { nome: 'Claude Makélélé', positions: ['CDM'], minInterceptions: 87, minStandingTackle: 86, minReactions: 85 },
  fabinho: { nome: 'Fabinho', positions: ['CDM'], minInterceptions: 85, minStandingTackle: 84, minStrength: 82 },
  busquets: { nome: 'Sergio Busquets', positions: ['CDM'], minShortPassing: 87, minInterceptions: 83, minComposure: 87 },
  gattuso: { nome: 'Gennaro Gattuso', positions: ['CDM'], minStamina: 88, minAggression: 88, minStandingTackle: 85 },
  matthaus: { nome: 'Lothar Matthäus', positions: ['CDM', 'CM'], minLongShots: 85, minStamina: 86, minShortPassing: 85 },
  desailly: { nome: 'Marcel Desailly', positions: ['CDM'], minDefensiveAwareness: 86, minStrength: 87, minStandingTackle: 85 },
  deschamps: { nome: 'Didier Deschamps', positions: ['CDM'], minInterceptions: 84, minStamina: 85, minComposure: 85 },
  davids: { nome: 'Edgar Davids', positions: ['CDM', 'CM'], minStamina: 88, minAggression: 87, minStandingTackle: 84 },
  casemiro: { nome: 'Casemiro', positions: ['CDM'], minInterceptions: 86, minStandingTackle: 85, minStrength: 84 },
  vieira: { nome: 'Patrick Vieira', positions: ['CDM', 'CM'], minStrength: 85, minInterceptions: 84, minLongPassing: 82 },
  toure: { nome: 'Yaya Touré', positions: ['CDM', 'CM'], minStrength: 86, minShotPower: 85, minStamina: 86 },

  // Meio-campistas / armadores
  zidane: { nome: 'Zidane', positions: ['CM', 'CAM'], minVision: 88, minShortPassing: 85, minComposure: 85 },
  pirlo: { nome: 'Andrea Pirlo', positions: ['CM', 'CDM'], minVision: 87, minShortPassing: 88, minLongPassing: 86, minComposure: 85 },
  xavi: { nome: 'Xavi', positions: ['CM'], minShortPassing: 90, minVision: 89, minBallControl: 88 },
  iniesta: { nome: 'Andrés Iniesta', positions: ['CM', 'CAM'], minDribbling: 88, minVision: 88, minShortPassing: 88 },
  modric: { nome: 'Luka Modrić', positions: ['CM'], minVision: 88, minLongPassing: 87, minShortPassing: 87 },
  debruyne: { nome: 'Kevin De Bruyne', positions: ['CM', 'CAM'], minVision: 90, minLongPassing: 88, minShotPower: 85 },
  kroos: { nome: 'Toni Kroos', positions: ['CM'], minLongPassing: 90, minShortPassing: 88, minVision: 86 },
  rijkaard: { nome: 'Frank Rijkaard', positions: ['CM', 'CDM'], minStrength: 84, minShortPassing: 85, minInterceptions: 82 },
  redondo: { nome: 'Fernando Redondo', positions: ['CM', 'CDM'], minVision: 86, minLongPassing: 85, minBallControl: 87 },
  scholes: { nome: 'Paul Scholes', positions: ['CM'], minLongShots: 87, minShortPassing: 87, minVision: 86 },
  gerrard: { nome: 'Steven Gerrard', positions: ['CM', 'CAM'], minShotPower: 88, minLongPassing: 85, minStamina: 85 },
  lampard: { nome: 'Frank Lampard', positions: ['CM', 'CAM'], minShotPower: 87, minLongShots: 86, minPositioning: 85 },

  // Meio-ofensivos / pontas
  ronaldinho: { nome: 'Ronaldinho', positions: ['LW', 'CAM'], minDribbling: 88, skillMoves: 5, minAgility: 85 },
  messi: { nome: 'Lionel Messi', positions: ['RW', 'CAM'], minDribbling: 92, minBallControl: 91, minAgility: 90, skillMoves: 5 },
  neymar: { nome: 'Neymar', positions: ['LW', 'CAM'], minDribbling: 90, minAgility: 88, skillMoves: 5, minBallControl: 88 },
  garrincha: { nome: 'Garrincha', positions: ['RW'], minDribbling: 90, minAgility: 89, minSprintSpeed: 84 },
  best: { nome: 'George Best', positions: ['RW', 'LW'], minDribbling: 88, minAgility: 87, minBallControl: 86 },
  cruyff: { nome: 'Johan Cruyff', positions: ['CAM', 'ST'], minVision: 87, minDribbling: 87, minBallControl: 87 },
  maradona: { nome: 'Diego Maradona', positions: ['CAM'], minDribbling: 92, minVision: 89, minBallControl: 90, skillMoves: 5 },
  robben: { nome: 'Arjen Robben', positions: ['RW'], minDribbling: 87, minSprintSpeed: 87, minCurve: 86 },
  ribery: { nome: 'Franck Ribéry', positions: ['LW'], minDribbling: 88, minAgility: 87, minCrossing: 84 },
  figo: { nome: 'Luís Figo', positions: ['RW', 'RM'], minDribbling: 85, minCrossing: 85, minShortPassing: 84 },
  kaka: { nome: 'Kaká', positions: ['CAM'], minDribbling: 86, minLongShots: 82, minSprintSpeed: 75 },
  overmars: { nome: 'Marc Overmars', positions: ['LW', 'LM'], minSprintSpeed: 88, minDribbling: 85, minAcceleration: 88 },
  zico: { nome: 'Zico', positions: ['CAM'], minFreeKickAccuracy: 88, minVision: 87, minShortPassing: 86 },
  hazard: { nome: 'Eden Hazard', positions: ['LW', 'CAM'], minDribbling: 89, minBallControl: 88, minAgility: 87 },
  salah: { nome: 'Mohamed Salah', positions: ['RW', 'RM'], minSprintSpeed: 88, minFinishing: 87, minDribbling: 86 },
  sanchez: { nome: 'Alexis Sánchez', positions: ['LW', 'RW'], minDribbling: 85, minSprintSpeed: 85, minFinishing: 83 },

  // Atacantes
  ronaldo: { nome: 'Ronaldo Fenômeno', positions: ['ST'], minFinishing: 88, minSprintSpeed: 87, minDribbling: 86, skillMoves: 5 },
  r9: { nome: 'Ronaldo Fenômeno', positions: ['ST'], minFinishing: 88, minSprintSpeed: 87, minDribbling: 86, skillMoves: 5 },
  pele: { nome: 'Pelé', positions: ['ST', 'CAM'], minFinishing: 90, minDribbling: 88, minShotPower: 87 },
  vanbasten: { nome: 'Marco van Basten', positions: ['ST'], minFinishing: 90, minHeadingAccuracy: 84, minPositioning: 88 },
  henry: { nome: 'Thierry Henry', positions: ['ST'], minSprintSpeed: 89, minFinishing: 89, minPositioning: 88 },
  shevchenko: { nome: 'Andriy Shevchenko', positions: ['ST'], minFinishing: 89, minSprintSpeed: 86, minHeadingAccuracy: 82 },
  batistuta: { nome: 'Gabriel Batistuta', positions: ['ST'], minShotPower: 91, minFinishing: 89, minHeadingAccuracy: 80 },
  eusebio: { nome: 'Eusébio', positions: ['ST'], minFinishing: 89, minSprintSpeed: 87, minShotPower: 88 },
  gerdmuller: { nome: 'Gerd Müller', positions: ['ST'], minFinishing: 91, minPositioning: 90, minReactions: 88 },
  lewandowski: { nome: 'Robert Lewandowski', positions: ['ST'], minFinishing: 91, minHeadingAccuracy: 85, minPositioning: 90 },
  inzaghi: { nome: 'Filippo Inzaghi', positions: ['ST'], minPositioning: 90, minFinishing: 88, minReactions: 86 },
  raul: { nome: 'Raúl', positions: ['ST'], minFinishing: 88, minPositioning: 87, minComposure: 86 },
  delpiero: { nome: 'Alessandro Del Piero', positions: ['ST', 'CAM'], minFinishing: 87, minFreeKickAccuracy: 87, minCurve: 85 },
  totti: { nome: 'Francesco Totti', positions: ['ST', 'CAM'], minVision: 86, minFinishing: 85, minShortPassing: 84 },
  suarez: { nome: 'Luis Suárez', positions: ['ST'], minFinishing: 90, minDribbling: 85, minAggression: 85 },
  cavani: { nome: 'Edinson Cavani', positions: ['ST'], minFinishing: 88, minSprintSpeed: 84, minHeadingAccuracy: 83 },
  cristianoronaldo: { nome: 'Cristiano Ronaldo', positions: ['ST', 'LW'], minFinishing: 91, minSprintSpeed: 88, minShotPower: 92, minHeadingAccuracy: 86 },
  drogba: { nome: 'Didier Drogba', positions: ['ST'], minStrength: 88, minFinishing: 87, minHeadingAccuracy: 85 },
  ibrahimovic: { nome: 'Zlatan Ibrahimović', positions: ['ST'], minStrength: 86, minFinishing: 89, minBalance: 82 },
  aguero: { nome: 'Sergio Agüero', positions: ['ST'], minFinishing: 90, minReactions: 88, minDribbling: 84 },
  benzema: { nome: 'Karim Benzema', positions: ['ST'], minFinishing: 88, minBallControl: 87, minPositioning: 88 },
  romario: { nome: 'Romário', positions: ['ST'], minFinishing: 90, minReactions: 88, minAgility: 85 },
  rivaldo: { nome: 'Rivaldo', positions: ['ST', 'CAM'], minCurve: 88, minFinishing: 86, minDribbling: 86 },
  weah: { nome: 'George Weah', positions: ['ST'], minSprintSpeed: 87, minFinishing: 86, minStrength: 84 },
  owen: { nome: 'Michael Owen', positions: ['ST'], minSprintSpeed: 89, minFinishing: 87, minReactions: 86 },
  shearer: { nome: 'Alan Shearer', positions: ['ST'], minFinishing: 89, minShotPower: 88, minHeadingAccuracy: 84 },
  vieri: { nome: 'Christian Vieri', positions: ['ST'], minShotPower: 88, minHeadingAccuracy: 85, minFinishing: 87 },
};
