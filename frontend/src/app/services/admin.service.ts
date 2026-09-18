import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface UploadCSVResponse {
  sucesso: boolean;
  mensagem: string;
  totalLinhasCSV: number;
  totalJogadoresValidos: number;
  operacoes: {
    insercoes: number;
    atualizacoes: number;
  };
}

export interface ListarBackupsResponse {
  sucesso: boolean;
  backups: string[];
  totalBackups: number;
  mensagem?: string;
}

export interface RestaurarBackupResponse {
  sucesso: boolean;
  mensagem: string;
  backup: string;
  totalLinhasCSV: number;
  totalJogadoresValidos: number;
  operacoes: {
    insercoes: number;
    atualizacoes: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  readonly uploading = signal(false);
  readonly uploadResult = signal<UploadCSVResponse | null>(null);
  readonly uploadError = signal<string | null>(null);

  readonly loadingBackups = signal(false);
  readonly backups = signal<string[]>([]);
  readonly backupsError = signal<string | null>(null);

  readonly restoring = signal(false);
  readonly restoreResult = signal<RestaurarBackupResponse | null>(null);
  readonly restoreError = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  /**
   * Faz o upload de um arquivo CSV para o backend
   * @param file Arquivo CSV a ser enviado
   * @param token Token JWT do usuário autenticado
   */
  async uploadCSV(file: File, token: string): Promise<void> {
    // Validação básica
    if (!file) {
      this.uploadError.set('Nenhum arquivo selecionado.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.uploadError.set('Apenas arquivos CSV são permitidos.');
      return;
    }

    if (file.size === 0) {
      this.uploadError.set('Arquivo CSV vazio.');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadResult.set(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Criar headers com apenas Authorization (sem Content-Type)
      // O HttpClient definirá Content-Type automaticamente para FormData
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });

      const response = await firstValueFrom(
        this.http.post<UploadCSVResponse>(`${this.apiUrl}/upload-csv`, formData, {
          headers,
        })
      );

      this.uploadResult.set(response);
      console.log('[AdminService] Upload bem-sucedido:', response);
    } catch (erro: any) {
      const mensagemErro =
        erro?.error?.message ||
        erro?.error?.error ||
        erro?.message ||
        'Erro desconhecido ao fazer upload. Verifique sua permissão de admin.';

      this.uploadError.set(mensagemErro);
      console.error('[AdminService] Erro ao fazer upload:', erro);
    } finally {
      this.uploading.set(false);
    }
  }

  /**
   * Limpa os sinais de resultado e erro
   */
  limparResultado(): void {
    this.uploadResult.set(null);
    this.uploadError.set(null);
  }

  /**
   * Lista os arquivos de backup disponíveis
   * @param token Token JWT do usuário autenticado
   */
  async listarBackups(token: string): Promise<void> {
    this.loadingBackups.set(true);
    this.backupsError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ListarBackupsResponse>(`${this.apiUrl}/backups`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      );

      if (response.sucesso) {
        this.backups.set(response.backups);
        console.log('[AdminService] Backups carregados:', response.backups);
      } else {
        this.backupsError.set('Erro ao carregar backups.');
      }
    } catch (erro: any) {
      const mensagemErro =
        erro?.error?.message ||
        erro?.message ||
        'Erro ao carregar lista de backups. Verifique sua permissão de admin.';

      this.backupsError.set(mensagemErro);
      console.error('[AdminService] Erro ao listar backups:', erro);
    } finally {
      this.loadingBackups.set(false);
    }
  }

  /**
   * Restaura dados a partir de um arquivo de backup
   * @param filename Nome do arquivo de backup
   * @param token Token JWT do usuário autenticado
   */
  async restaurarBackup(filename: string, token: string): Promise<void> {
    if (!filename) {
      this.restoreError.set('Nome do arquivo de backup é obrigatório.');
      return;
    }

    this.restoring.set(true);
    this.restoreError.set(null);
    this.restoreResult.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<RestaurarBackupResponse>(
          `${this.apiUrl}/restore-backup`,
          { filename },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        )
      );

      this.restoreResult.set(response);
      console.log('[AdminService] Backup restaurado com sucesso:', response);
    } catch (erro: any) {
      const mensagemErro =
        erro?.error?.message ||
        erro?.message ||
        'Erro desconhecido ao restaurar backup. Verifique sua permissão de admin.';

      this.restoreError.set(mensagemErro);
      console.error('[AdminService] Erro ao restaurar backup:', erro);
    } finally {
      this.restoring.set(false);
    }
  }

  /**
   * Limpa os sinais de restauração
   */
  limparRestauracao(): void {
    this.restoreResult.set(null);
    this.restoreError.set(null);
  }
}

