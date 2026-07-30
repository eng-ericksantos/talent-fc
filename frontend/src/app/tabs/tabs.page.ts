import { Component, effect, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  heartOutline,
  homeOutline,
  searchOutline,
  trendingUpOutline,
} from 'ionicons/icons';

export type AppLanguage = 'pt' | 'en' | 'es';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    TranslatePipe,
  ],
})
export class TabsPage {
  private readonly translate = inject(TranslateService);

  readonly selectedLang = signal<AppLanguage>('pt');

  readonly languages: { code: AppLanguage; flag: string }[] = [
    { code: 'pt', flag: '🇧🇷' },
    { code: 'en', flag: '🇺🇸' },
    { code: 'es', flag: '🇪🇸' },
  ];

  constructor() {
    addIcons({ homeOutline, searchOutline, heartOutline, trendingUpOutline });

    // Reactive language switching via Signals — no interceptor, no global side effects
    effect(() => {
      this.translate.use(this.selectedLang());
    });
  }

  setLanguage(lang: AppLanguage): void {
    this.selectedLang.set(lang);
  }
}
