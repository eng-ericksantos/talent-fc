import { Injectable, signal, effect } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const CHAVE_FAVORITOS = 'favoriteIds';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  readonly favoritosIds = signal<number[]>([]);

  constructor() {
    this.carregarFavoritos();
    effect(() => {
      this.salvarFavoritos(this.favoritosIds());
    });
  }

  private async carregarFavoritos(): Promise<void> {
    const { value } = await Preferences.get({ key: CHAVE_FAVORITOS });
    if (value) {
      this.favoritosIds.set(JSON.parse(value) as number[]);
    }
  }

  private async salvarFavoritos(ids: number[]): Promise<void> {
    await Preferences.set({ key: CHAVE_FAVORITOS, value: JSON.stringify(ids) });
  }

  toggleFavorito(id: number): void {
    const atual = this.favoritosIds();
    if (atual.includes(id)) {
      this.favoritosIds.set(atual.filter((itemId) => itemId !== id));
    } else {
      this.favoritosIds.set([...atual, id]);
    }
  }

  isFavorito(id: number): boolean {
    return this.favoritosIds().includes(id);
  }
}
