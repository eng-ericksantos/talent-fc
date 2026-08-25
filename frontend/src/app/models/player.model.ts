export interface AtributosJogador {
  visao?: number;
  passe_curto?: number;
  controle_bola?: number;
  compostura?: number;
  drible?: number;
  agilidade?: number;
}

export interface Jogador {
  _id?: string;
  id: string;
  nome: string;
  idade: number;
  overall: number;
  potencial: number;
  posicao: string;
  nacionalidade: string;
  valorMercado: string;
  fotoUrl: string;
  categoria: 'wonderkid' | 'gem' | 'veteran' | 'legend';
  matchPercentage?: number;
  atributos?: AtributosJogador;
}

export interface RespostaPaginada<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
