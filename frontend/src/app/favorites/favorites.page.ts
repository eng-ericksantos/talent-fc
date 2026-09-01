import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heart, heartOutline, heartDislikeOutline } from 'ionicons/icons';
import { environment } from '../../environments/environment';
import { Jogador } from '../models/player.model';
import { FavoriteService } from '../services/favorite.service';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-favorites',
  templateUrl: 'favorites.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IonIcon],
})
export class FavoritesPage {
  readonly favoritoService = inject(FavoriteService);
  private readonly playerService = inject(PlayerService);

  readonly jogadoresFavoritos = computed(() => {
    const ids = this.favoritoService.favoritosIds();
    return this.playerService.todosJogadores().filter((j) => ids.includes(j.id));
  });

  constructor() {
    addIcons({ heart, heartOutline, heartDislikeOutline });
  }

  limparFoto(evento: Event): void {
    (evento.target as HTMLImageElement).style.display = 'none';
  }

  fotoUrl(jogador: Jogador): string {
    return `${environment.apiUrl}/players/proxy-image?eaId=${jogador.eaPlayerId}`;
  }
}
