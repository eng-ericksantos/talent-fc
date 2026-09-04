import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';

export type AppLanguage = 'pt' | 'en' | 'es';

interface LanguageOption {
  codigo: AppLanguage;
  bandeira: string;
  sigla: string;
  nome: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  standalone: true,
})
export class LanguageSelectorComponent {
  private readonly traducao = inject(TranslateService);

  readonly idiomaAtivo = signal<AppLanguage>('pt');

  readonly idiomas: LanguageOption[] = [
    { codigo: 'pt', bandeira: '🇧🇷', sigla: 'PT', nome: 'Português' },
    { codigo: 'en', bandeira: '🇺🇸', sigla: 'EN', nome: 'English' },
    { codigo: 'es', bandeira: '🇪🇸', sigla: 'ES', nome: 'Español' },
  ];

  constructor() {
    effect(() => {
      this.traducao.use(this.idiomaAtivo());
    });
  }

  definirIdioma(idioma: AppLanguage): void {
    this.idiomaAtivo.set(idioma);
  }
}
