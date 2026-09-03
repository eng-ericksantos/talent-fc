import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe],
})
export class AdminPage {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly activeVersion = signal<number>(26);
  readonly isSyncing = signal<boolean>(false);
  readonly usuarioEmail = this.authService.userEmail;

  atualizarScraper(): void {
    if (this.isSyncing()) return;
    this.isSyncing.set(true);

    this.http
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

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
