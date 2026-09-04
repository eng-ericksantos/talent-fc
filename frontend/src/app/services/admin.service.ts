import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  readonly uploading = signal(false);
  readonly uploadResult = signal<UploadCSVResponse | null>(null);
  readonly uploadError = signal<string | null>(null);

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

      const response = await firstValueFrom(
        this.http.post<UploadCSVResponse>(`${this.apiUrl}/upload-csv`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      );

      this.uploadResult.set(response);
      console.log('[AdminService] Upload bem-sucedido:', response);
    } catch (erro: any) {
      const mensagemErro =
        erro?.error?.message ||
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
}
