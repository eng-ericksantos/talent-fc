import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Jogador, RespostaPaginada } from '../models/player.model';

type Categoria = 'wonderkid' | 'gem' | 'veteran';

export interface SearchFilters {
  maxAge?: number;
  minPot?: number;
  position?: string;
}

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

  // Filtros avançados
  readonly #filtros = signal<SearchFilters>({});

  // Chave da lenda ativada pela API (ex: 'zidane', 'ronaldinho') ou null se busca comum
  readonly legendMatched = signal<string | null>(null);

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

  readonly todosJogadores = this.#jogadores.asReadonly();

  readonly searchResults = this.#resultadosBusca.asReadonly();

  constructor() {
    // Dispara busca server-side automaticamente ao mudar a query
    effect(() => {
      const query = this.searchQuery().trim();
      if (query) {
        this.#paginaBusca.set(1);
        this.#carregarBusca(query, 1);
      } else {
        this.#resultadosBusca.set([]);
        this.totalBusca.set(0);
        this.legendMatched.set(null);
      }
    });
  }

  setSearchFilters(filtros: SearchFilters): void {
    this.#filtros.set(filtros);
    const query = this.searchQuery().trim();
    if (query) {
      this.#paginaBusca.set(1);
      this.#carregarBusca(query, 1);
    }
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
        // Normaliza _id do MongoDB para id antes da deduplicação
        const normalizados = resp.data.map((j) => ({ ...j, id: j.id ?? j._id ?? '' }));
        const idsExistentes = new Set(this.#jogadores().map((j) => j.id));
        const novos = normalizados.filter((j) => !idsExistentes.has(j.id));
        this.#jogadores.set([...this.#jogadores(), ...novos]);
      });
  }

  #carregarBusca(query: string, pagina: number): void {
    const filtros = this.#filtros();
    let url = `${environment.apiUrl}/players?search=${encodeURIComponent(query)}&page=${pagina}&limit=20`;

    if (filtros.maxAge) {
      url += `&maxAge=${filtros.maxAge}`;
    }
    if (filtros.minPot) {
      url += `&minPot=${filtros.minPot}`;
    }
    if (filtros.position) {
      url += `&position=${encodeURIComponent(filtros.position)}`;
    }

    this.#http
      .get<RespostaPaginada<Jogador>>(url)
      .pipe(
        catchError((erro) => {
          console.error('[PlayerService] Falha na busca:', erro);
          return of(null);
        })
      )
      .subscribe((resp) => {
        if (!resp) return;
        this.totalBusca.set(resp.total);
        this.legendMatched.set(resp.legendMatched ?? null);
        const normalizados = resp.data.map((j) => ({ ...j, id: j.id ?? j._id ?? '' }));
        if (pagina === 1) {
          this.#resultadosBusca.set(normalizados);
        } else {
          this.#resultadosBusca.set([...this.#resultadosBusca(), ...normalizados]);
        }
      });
  }

  getPlayerById(id: string): Jogador | undefined {
    const noPrincipal = this.#jogadores().filter((j) => j.id === id);
    if (noPrincipal.length > 0) return noPrincipal[0];
    // Fallback: busca server-side ainda não normalizada no pool principal
    return this.#resultadosBusca().filter((j) => j.id === id)[0];
  }
}
