export interface Jogador {
  id: number;
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
}
