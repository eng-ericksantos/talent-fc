import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowBackOutline, flashOutline, heart, heartOutline } from 'ionicons/icons';
import { environment } from '../../environments/environment';
import { Jogador } from '../models/player.model';
import { FavoriteService } from '../services/favorite.service';
import { PlayerService } from '../services/player.service';

interface AtributoDisplay {
  labelKey: string;
  valor: number;
}

@Component({
  selector: 'app-player-detail',
  templateUrl: 'player-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IonIcon],
})
export class PlayerDetailComponent {
  readonly #playerService = inject(PlayerService);
  readonly #location = inject(Location);
  readonly favoritoService = inject(FavoriteService);

  // input() binding automático do parâmetro de rota via withComponentInputBinding()
  readonly id = input.required<string>();

  readonly jogador = computed(() => this.#playerService.getPlayerById(this.id()));

  readonly atributos = computed((): AtributoDisplay[] => {
    const a = this.jogador()?.atributos;
    if (!a) return [];
    return [
      { labelKey: 'DETALHE.ATTR_VISAO', valor: a.visao ?? 0 },
      { labelKey: 'DETALHE.ATTR_PASSE', valor: a.passe_curto ?? 0 },
      { labelKey: 'DETALHE.ATTR_CONTROLE', valor: a.controle_bola ?? 0 },
      { labelKey: 'DETALHE.ATTR_DRIBLE', valor: a.drible ?? 0 },
      { labelKey: 'DETALHE.ATTR_COMPOSTURA', valor: a.compostura ?? 0 },
      { labelKey: 'DETALHE.ATTR_AGILIDADE', valor: a.agilidade ?? 0 },
    ].filter((attr) => attr.valor > 0);
  });

  constructor() {
    addIcons({ arrowBackOutline, flashOutline, heart, heartOutline });
  }

  voltar(): void {
    this.#location.back();
  }

  corBarra(valor: number): string {
    if (valor >= 85) return 'bg-soccer-green';
    if (valor >= 75) return 'bg-yellow-400';
    if (valor >= 60) return 'bg-orange-400';
    return 'bg-red-500';
  }

  fotoUrl(jogador: Jogador): string {
    return `${environment.apiUrl}/players/proxy-image?eaId=${jogador.eaPlayerId}`;
  }

  limparFoto(evento: Event): void {
    (evento.target as HTMLImageElement).style.display = 'none';
  }
}
