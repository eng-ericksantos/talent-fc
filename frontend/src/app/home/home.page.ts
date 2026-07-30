import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { FavoriteService } from '../services/favorite.service';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IonIcon],
})
export class HomePage {
  readonly playerService = inject(PlayerService);
  readonly favoritoService = inject(FavoriteService);

  constructor() {
    addIcons({ heart, heartOutline });
  }

  limparFoto(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
