import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Jogador } from '../models/player.model';

const CLONES_ZIDANE: Jogador[] = [
  {
    id: '101',
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
    id: '102',
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
    id: '103',
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
  readonly #http = inject(HttpClient);
  readonly #jogadores = signal<Jogador[]>([]);

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

  loadPlayers(): void {
    this.#http
      .get<Jogador[]>(`${environment.apiUrl}/players`)
      .pipe(
        catchError((erro) => {
          console.error('[PlayerService] Falha ao carregar jogadores:', erro);
          return of([]);
        })
      )
      .subscribe((jogadores) => this.#jogadores.set(jogadores));
  }
}
