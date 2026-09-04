import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Favorito {
  _id?: string;
  userId: string;
  eaPlayerId: number;
  jogadorNome?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly apiUrl = `${environment.apiUrl}/favorites`;
  readonly favoritosIds = signal<string[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {
    this.carregarFavoritos();
  }

  private async carregarFavoritos(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const favoritos = await firstValueFrom(this.http.get<Favorito[]>(this.apiUrl));
      this.favoritosIds.set(favoritos.map((f) => String(f.eaPlayerId)));
    } catch (erro) {
      console.error('[FavoriteService] Erro ao carregar favoritos:', erro);
      this.erro.set('Erro ao carregar favoritos');
    } finally {
      this.carregando.set(false);
    }
  }

  async toggleFavorito(eaPlayerId: string | number, jogadorNome?: string): Promise<void> {
    const id = Number(eaPlayerId);

    // Validação defensiva
    if (!eaPlayerId || isNaN(id) || id <= 0) {
      console.error('[FavoriteService] Erro: ID do jogador (eaPlayerId) inválido ou não encontrado', eaPlayerId);
      this.erro.set('Erro: Identificador do jogador não disponível');
      return;
    }

    const idString = String(id);
    const atual = this.favoritosIds();

    try {
      if (atual.includes(idString)) {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
        this.favoritosIds.set(atual.filter((i) => i !== idString));
      } else {
        await firstValueFrom(
          this.http.post<Favorito>(this.apiUrl, {
            eaPlayerId: id,
            jogadorNome,
          }),
        );
        this.favoritosIds.set([...atual, idString]);
      }
      this.erro.set(null);
    } catch (erro) {
      console.error('[FavoriteService] Erro ao alternar favorito:', erro);
      this.erro.set('Erro ao alterar favorito');
    }
  }

  async adicionarFavorito(eaPlayerId: string | number, jogadorNome?: string): Promise<void> {
    const id = Number(eaPlayerId);
    const idString = String(id);
    const atual = this.favoritosIds();

    if (atual.includes(idString)) {
      return; // Já é favorito
    }

    try {
      await firstValueFrom(
        this.http.post<Favorito>(this.apiUrl, {
          eaPlayerId: id,
          jogadorNome,
        }),
      );
      this.favoritosIds.set([...atual, idString]);
      this.erro.set(null);
    } catch (erro) {
      console.error('[FavoriteService] Erro ao adicionar favorito:', erro);
      this.erro.set('Erro ao adicionar favorito');
    }
  }

  async removerFavorito(eaPlayerId: string | number): Promise<void> {
    const id = Number(eaPlayerId);
    const idString = String(id);
    const atual = this.favoritosIds();

    if (!atual.includes(idString)) {
      return; // Já não é favorito
    }

    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.favoritosIds.set(atual.filter((i) => i !== idString));
      this.erro.set(null);
    } catch (erro) {
      console.error('[FavoriteService] Erro ao remover favorito:', erro);
      this.erro.set('Erro ao remover favorito');
    }
  }

  isFavorito(id: string | number): boolean {
    return this.favoritosIds().includes(String(Number(id)));
  }
}
