import { Injectable, signal, computed } from '@angular/core';
import { Jogador } from '../models/player.model';

const CLONES_ZIDANE: Jogador[] = [
  {
    id: 101,
    nome: 'Enzo Le Fée',
    idade: 24,
    overall: 78,
    potencial: 86,
    posicao: 'CM',
    nacionalidade: '🇫🇷',
    valorMercado: '€30M',
    fotoUrl: 'https://cdn.sofifa.net/players/266139/25_240.png',
    categoria: 'gem',
    matchPercentage: 91,
  },
  {
    id: 102,
    nome: 'Hannibal Mejbri',
    idade: 22,
    overall: 76,
    potencial: 85,
    posicao: 'CM',
    nacionalidade: '🇹🇳',
    valorMercado: '€18M',
    fotoUrl: 'https://cdn.sofifa.net/players/268917/25_240.png',
    categoria: 'wonderkid',
    matchPercentage: 87,
  },
  {
    id: 103,
    nome: 'Rayan Cherki',
    idade: 21,
    overall: 79,
    potencial: 90,
    posicao: 'CAM',
    nacionalidade: '🇫🇷',
    valorMercado: '€45M',
    fotoUrl: 'https://cdn.sofifa.net/players/265809/25_240.png',
    categoria: 'wonderkid',
    matchPercentage: 84,
  },
];

@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly #jogadores = signal<Jogador[]>([
    {
      id: 1,
      nome: 'Lamine Yamal',
      idade: 17,
      overall: 82,
      potencial: 95,
      posicao: 'RW',
      nacionalidade: '🇪🇸',
      valorMercado: '€90M',
      fotoUrl: 'https://cdn.sofifa.net/players/278166/25_240.png',
      categoria: 'wonderkid',
    },
    {
      id: 2,
      nome: 'Pedri González',
      idade: 22,
      overall: 87,
      potencial: 93,
      posicao: 'CM',
      nacionalidade: '🇪🇸',
      valorMercado: '€120M',
      fotoUrl: 'https://cdn.sofifa.net/players/261777/25_240.png',
      categoria: 'wonderkid',
    },
    {
      id: 3,
      nome: 'Warren Zaïre-Emery',
      idade: 18,
      overall: 79,
      potencial: 91,
      posicao: 'CM',
      nacionalidade: '🇫🇷',
      valorMercado: '€55M',
      fotoUrl: 'https://cdn.sofifa.net/players/270893/25_240.png',
      categoria: 'wonderkid',
    },
    {
      id: 4,
      nome: 'Nico González',
      idade: 22,
      overall: 78,
      potencial: 87,
      posicao: 'CM',
      nacionalidade: '🇪🇸',
      valorMercado: '€28M',
      fotoUrl: 'https://cdn.sofifa.net/players/261993/25_240.png',
      categoria: 'gem',
    },
    {
      id: 5,
      nome: 'Manu Koné',
      idade: 23,
      overall: 80,
      potencial: 88,
      posicao: 'CDM',
      nacionalidade: '🇫🇷',
      valorMercado: '€35M',
      fotoUrl: 'https://cdn.sofifa.net/players/262622/25_240.png',
      categoria: 'gem',
    },
    {
      id: 6,
      nome: 'Luka Modrić',
      idade: 39,
      overall: 85,
      potencial: 83,
      posicao: 'CM',
      nacionalidade: '🇭🇷',
      valorMercado: '€8M',
      fotoUrl: 'https://cdn.sofifa.net/players/177003/25_240.png',
      categoria: 'veteran',
    },
    {
      id: 7,
      nome: 'Karim Benzema',
      idade: 37,
      overall: 84,
      potencial: 82,
      posicao: 'ST',
      nacionalidade: '🇫🇷',
      valorMercado: '€12M',
      fotoUrl: 'https://cdn.sofifa.net/players/165153/25_240.png',
      categoria: 'veteran',
    },
  ]);

  readonly topPromessas = computed(() =>
    this.#jogadores().filter((j) => j.categoria === 'wonderkid')
  );

  readonly joiasEscondidas = computed(() =>
    this.#jogadores().filter((j) => j.categoria === 'gem')
  );

  readonly veteranos = computed(() =>
    this.#jogadores().filter((j) => j.categoria === 'veteran')
  );

  readonly searchQuery = signal<string>('');

  readonly modoZidane = computed(() =>
    this.searchQuery().toLowerCase().includes('zidane')
  );

  readonly todosJogadores = this.#jogadores.asReadonly();

  readonly searchResults = computed((): Jogador[] => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    if (this.modoZidane()) return CLONES_ZIDANE;
    return this.#jogadores().filter((j) =>
      j.nome.toLowerCase().includes(query)
    );
  });
}
