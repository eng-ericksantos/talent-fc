import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { environment } from '../../environments/environment';
import { Jogador } from '../models/player.model';
import { FavoriteService } from '../services/favorite.service';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FormsModule, IonIcon, RouterLink],
})
export class SearchPage {
  readonly playerService = inject(PlayerService);
  readonly favoritoService = inject(FavoriteService);

  readonly isFilterOpen = signal(false);
  readonly maxAge = signal(21);
  readonly minPot = signal(80);
  readonly position = signal('');

  constructor() {
    addIcons({ heart, heartOutline });
  }

  readonly toggleFilters = () => {
    this.isFilterOpen.update((value) => !value);
  };

  readonly aplicarFiltros = () => {
    this.playerService.setSearchFilters({
      maxAge: this.maxAge(),
      minPot: this.minPot(),
      position: this.position(),
    });
    this.isFilterOpen.set(false);
  };

  readonly limparFoto = (event: Event) => {
    (event.target as HTMLImageElement).style.display = 'none';
  };

  fotoUrl(jogador: Jogador): string {
    return `${environment.apiUrl}/players/proxy-image?eaId=${jogador.eaPlayerId}`;
  }
}

