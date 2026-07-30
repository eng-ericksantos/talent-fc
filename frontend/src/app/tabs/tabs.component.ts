import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heartOutline, homeOutline, searchOutline, settingsOutline } from 'ionicons/icons';

export type AppLanguage = 'pt' | 'en' | 'es';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IonIcon, TranslatePipe],
})
export class TabsComponent {
  private readonly traducao = inject(TranslateService);

  readonly idiomaAtivo = signal<AppLanguage>('pt');

  readonly idiomas: { codigo: AppLanguage; bandeira: string }[] = [
    { codigo: 'pt', bandeira: '🇧🇷' },
    { codigo: 'en', bandeira: '🇺🇸' },
    { codigo: 'es', bandeira: '🇪🇸' },
  ];

  constructor() {
    addIcons({ homeOutline, searchOutline, heartOutline, settingsOutline });

    effect(() => {
      this.traducao.use(this.idiomaAtivo());
    });
  }

  definirIdioma(idioma: AppLanguage): void {
    this.idiomaAtivo.set(idioma);
  }
}
