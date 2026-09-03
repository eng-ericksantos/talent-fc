import { Injectable, computed, inject } from '@angular/core';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // E-mail Master do sistema (Admin)
  private readonly ADMIN_EMAIL = 'eng.erickalessandro@gmail.com';

  private readonly auth = inject(Auth);

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

  /**
   * Realiza logout
   */
  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
