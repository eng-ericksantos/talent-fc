import { Injectable, computed, inject, effect } from '@angular/core';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

type AppLanguage = 'pt' | 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // E-mail Master do sistema (Admin)
  private readonly ADMIN_EMAIL = 'eng.erickalessandro@gmail.com';

  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  // Signal reativo do estado de autenticação
  readonly currentUser = toSignal(authState(this.auth), { initialValue: null });

  // Computed signal para verificar se é admin
  readonly isAdmin = computed(() => {
    const usuario = this.currentUser();
    if (!usuario?.email) return false;
    return usuario.email.toLowerCase() === this.ADMIN_EMAIL.toLowerCase();
  });

  // Computed signal para verificar se está autenticado
  readonly isAuthenticated = computed(() => !!this.currentUser());

  // E-mail do usuário autenticado
  readonly userEmail = computed(() => this.currentUser()?.email ?? null);

  // UID do usuário autenticado
  readonly userId = computed(() => this.currentUser()?.uid ?? null);

  constructor() {
    // Observar mudanças de idioma e atualizar Firebase Auth
    effect(() => {
      const idiomaAtivo = this.translateService.currentLang();
      this.setFirebaseLanguage(idiomaAtivo as AppLanguage);
    });

    // Inicializar com idioma padrão português
    this.setFirebaseLanguage('pt');
  }

  /**
   * Define o idioma dos emails do Firebase Auth
   * @param language Código do idioma: 'pt', 'en', ou 'es'
   */
  private setFirebaseLanguage(language: AppLanguage): void {
    // Mapear idiomas do ngx-translate para Firebase
    const firebaseLanguageMap: Record<AppLanguage, string> = {
      pt: 'pt',      // Português (Brasil)
      en: 'en',      // Inglês
      es: 'es',      // Espanhol
    };

    const firebaseLanguage = firebaseLanguageMap[language] || 'pt';
    this.auth.languageCode = firebaseLanguage;
  }

  /**
   * Realiza logout e redireciona para a tela de login
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.router.navigateByUrl('/login');
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
      throw erro;
    }
  }
}
