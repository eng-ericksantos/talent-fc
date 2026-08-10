import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, finalize, from, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FormsModule],
})
export class AdminPage {
  readonly #http = inject(HttpClient);
  readonly #auth = inject(Auth);

  private readonly usuarioAtual = toSignal(authState(this.#auth));
  readonly isLoggedIn = computed(() => !!this.usuarioAtual());

  readonly activeVersion = signal<number>(26);
  readonly isSyncing = signal<boolean>(false);
  readonly erroLogin = signal<string>('');

  email = '';
  senha = '';

  login(): void {
    this.erroLogin.set('');
    from(signInWithEmailAndPassword(this.#auth, this.email, this.senha)).pipe(
      catchError(() => {
        this.erroLogin.set('ADMIN.LOGIN_ERROR');
        return of(null);
      }),
    ).subscribe();
  }

  logout(): void {
    from(signOut(this.#auth)).subscribe();
  }

  atualizarScraper(): void {
    if (this.isSyncing()) return;
    this.isSyncing.set(true);

    this.#http
      .post(`${environment.apiUrl}/admin/trigger-worker`, {})
      .pipe(
        catchError((erro) => {
          console.error('[AdminPage] Falha ao acionar o worker:', erro);
          return of(null);
        }),
        finalize(() => this.isSyncing.set(false)),
      )
      .subscribe();
  }
}
