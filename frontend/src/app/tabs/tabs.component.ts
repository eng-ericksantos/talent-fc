import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heartOutline, homeOutline, searchOutline } from 'ionicons/icons';

export type AppLanguage = 'pt' | 'en' | 'es';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IonIcon, TranslatePipe],
})
export class TabsComponent {
  private readonly traducao = inject(TranslateService);
  private readonly router = inject(Router);

  // Easter egg: 5 cliques na logo em até 2s liberam o acesso administrativo
  private cliquesLogo = 0;
  private timeoutLogo?: ReturnType<typeof setTimeout>;

  readonly idiomaAtivo = signal<AppLanguage>('pt');

  readonly idiomas: { codigo: AppLanguage; bandeira: string }[] = [
    { codigo: 'pt', bandeira: '🇧🇷' },
    { codigo: 'en', bandeira: '🇺🇸' },
    { codigo: 'es', bandeira: '🇪🇸' },
  ];

  constructor() {
    addIcons({ homeOutline, searchOutline, heartOutline });

    effect(() => {
      this.traducao.use(this.idiomaAtivo());
    });
  }

  definirIdioma(idioma: AppLanguage): void {
    this.idiomaAtivo.set(idioma);
  }

  onLogoClick(): void {
    this.cliquesLogo++;
    clearTimeout(this.timeoutLogo);

    if (this.cliquesLogo >= 5) {
      this.cliquesLogo = 0;
      this.router.navigateByUrl('/tabs/admin');
      return;
    }

    this.timeoutLogo = setTimeout(() => (this.cliquesLogo = 0), 2000);
  }
}
