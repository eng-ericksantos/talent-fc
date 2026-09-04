import { Component, ChangeDetectionStrategy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe],
})
export class AdminPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly adminService = inject(AdminService);

  readonly activeVersion = signal<number>(26);
  readonly isSyncing = signal<boolean>(false);
  readonly usuarioEmail = this.authService.userEmail;
  readonly selectedFileName = signal<string | null>(null);

  runScraper(): void {
    if (this.isSyncing()) return;

    const selectedCycle = this.activeVersion();

    // Validação defensiva
    if (!selectedCycle || ![25, 26, 27].includes(selectedCycle)) {
      console.error('[AdminPage] Ciclo de jogo inválido:', selectedCycle);
      return;
    }

    console.log('Iniciando atualização do Scraper para:', `FC ${selectedCycle}`);
    this.isSyncing.set(true);

    try {
      // TODO: Integrar chamada HTTP ao backend
      // await this.http.post(`${environment.apiUrl}/admin/trigger-worker`, { cycle: selectedCycle }).toPromise();
      console.log('[AdminPage] Scraper disparado com sucesso para FC', selectedCycle);
    } catch (erro) {
      console.error('[AdminPage] Erro ao disparar Scraper:', erro);
    } finally {
      this.isSyncing.set(false);
    }
  }

  /**
   * Abre o selecionador de arquivo
   */
  abrirSeletorArquivo(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Manipula a seleção do arquivo
   */
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      this.selectedFileName.set(file.name);
    }
  }

  /**
   * Faz o upload do arquivo CSV
   */
  async uploadCSV(): Promise<void> {
    const file = this.fileInput.nativeElement.files?.[0];

    if (!file) {
      this.adminService.uploadError.set('Nenhum arquivo selecionado.');
      return;
    }

    // Obter token do usuário autenticado
    const user = this.authService.currentUser();
    if (!user) {
      this.adminService.uploadError.set('Usuário não autenticado.');
      return;
    }

    try {
      const token = await user.getIdToken();
      await this.adminService.uploadCSV(file, token);

      // Resetar o input file após upload bem-sucedido
      if (this.adminService.uploadResult()) {
        this.fileInput.nativeElement.value = '';
        this.selectedFileName.set(null);
      }
    } catch (erro) {
      console.error('[AdminPage] Erro ao obter token:', erro);
      this.adminService.uploadError.set('Erro ao obter token de autenticação.');
    }
  }

  /**
   * Limpa o resultado do upload
   */
  limparResultado(): void {
    this.adminService.limparResultado();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
