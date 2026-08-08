import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FormsModule],
})
export class AdminPage {
  readonly #http = inject(HttpClient);

  isLoggedIn = signal<boolean>(false);
  activeVersion = signal<number>(26);
  isSyncing = signal<boolean>(false);

  login(): void {
    this.isLoggedIn.set(true);
  }

  logout(): void {
    this.isLoggedIn.set(false);
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
