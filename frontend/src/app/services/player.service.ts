import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Jogador, RespostaPaginada } from '../models/player.model';

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

type Categoria = 'wonderkid' | 'gem' | 'veteran';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly #http = inject(HttpClient);

  // Pool acumulado de todos os jogadores carregados
  readonly #jogadores = signal<Jogador[]>([]);

  // Paginação por categoria
  readonly #paginaPromessas = signal(1);
  readonly #paginaGems = signal(1);
  readonly #paginaVeteranos = signal(1);
  readonly #paginaBusca = signal(1);

  // Resultados de busca server-side e pool paginado
  readonly #resultadosBusca = signal<Jogador[]>([]);

  // Totais expostos para o template controlar visibilidade do botão
  readonly totalPromessas = signal(0);
  readonly totalGems = signal(0);
  readonly totalVeteranos = signal(0);
  readonly totalBusca = signal(0);

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
    if (this.modoZidane()) return CLONES_ZIDANE;
    return this.#resultadosBusca();
  });

  constructor() {
    // Dispara busca server-side automaticamente ao mudar a query
    effect(() => {
      const query = this.searchQuery().trim();
      if (query && !this.modoZidane()) {
        this.#paginaBusca.set(1);
        this.#carregarBusca(query, 1);
      } else if (!query) {
        this.#resultadosBusca.set([]);
        this.totalBusca.set(0);
      }
    });
  }

  loadPlayers(): void {
    this.#carregarCategoria('wonderkid', 1);
    this.#carregarCategoria('gem', 1);
    this.#carregarCategoria('veteran', 1);
  }

  carregarMaisPromessas(): void {
    const proxima = this.#paginaPromessas() + 1;
    this.#paginaPromessas.set(proxima);
    this.#carregarCategoria('wonderkid', proxima);
  }

  carregarMaisGems(): void {
    const proxima = this.#paginaGems() + 1;
    this.#paginaGems.set(proxima);
    this.#carregarCategoria('gem', proxima);
  }

  carregarMaisVeteranos(): void {
    const proxima = this.#paginaVeteranos() + 1;
    this.#paginaVeteranos.set(proxima);
    this.#carregarCategoria('veteran', proxima);
  }

  carregarMaisBusca(): void {
    const proxima = this.#paginaBusca() + 1;
    this.#paginaBusca.set(proxima);
    this.#carregarBusca(this.searchQuery().trim(), proxima);
  }

  #carregarCategoria(categoria: Categoria, pagina: number): void {
    const totalSignal = {
      wonderkid: this.totalPromessas,
      gem: this.totalGems,
      veteran: this.totalVeteranos,
    }[categoria];

    this.#http
      .get<RespostaPaginada<Jogador>>(
        `${environment.apiUrl}/players/categoria/${categoria}?page=${pagina}&limit=20`
      )
      .pipe(
        catchError((erro) => {
          console.error(`[PlayerService] Falha ao carregar ${categoria}:`, erro);
          return of(null);
        })
      )
      .subscribe((resp) => {
        if (!resp) return;
        totalSignal.set(resp.total);
        // Deduplicação imutável por id — filter() sobre a coleção completa
        const idsExistentes = new Set(this.#jogadores().map((j) => j.id));
        const novos = resp.data.filter((j) => !idsExistentes.has(j.id));
        this.#jogadores.set([...this.#jogadores(), ...novos]);
      });
  }

  #carregarBusca(query: string, pagina: number): void {
    this.#http
      .get<RespostaPaginada<Jogador>>(
        `${environment.apiUrl}/players?search=${encodeURIComponent(query)}&page=${pagina}&limit=20`
      )
      .pipe(
        catchError((erro) => {
          console.error('[PlayerService] Falha na busca:', erro);
          return of(null);
        })
      )
      .subscribe((resp) => {
        if (!resp) return;
        this.totalBusca.set(resp.total);
        if (pagina === 1) {
          this.#resultadosBusca.set(resp.data);
        } else {
          this.#resultadosBusca.set([...this.#resultadosBusca(), ...resp.data]);
        }
      });
  }

  getPlayerById(id: string): Jogador | undefined {
    const noPrincipal = this.#jogadores().filter((j) => j.id === id);
    if (noPrincipal.length > 0) return noPrincipal[0];
    // Fallback: busca server-side + clones estáticos do modo Zidane
    return [...this.#resultadosBusca(), ...CLONES_ZIDANE].filter((j) => j.id === id)[0];
  }
}
