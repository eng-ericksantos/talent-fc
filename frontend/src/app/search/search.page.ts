import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { FavoriteService } from '../services/favorite.service';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FormsModule, IonIcon],
})
export class SearchPage {
  readonly playerService = inject(PlayerService);
  readonly favoritoService = inject(FavoriteService);

  constructor() {
    addIcons({ heart, heartOutline });
  }

  readonly limparFoto = (event: Event) => {
    (event.target as HTMLImageElement).style.display = 'none';
  };
}

