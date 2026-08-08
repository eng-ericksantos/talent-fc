import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map, of } from 'rxjs';

@Injectable()
export class AdminService {
  private readonly workerUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.workerUrl = this.configService.get<string>(
      'DATA_WORKER_URL',
      'http://talentfc_data_worker:8000',
    );
  }

  dispararWorker() {
    return this.httpService
      .post(`${this.workerUrl}/run-scraper`)
      .pipe(
        map((res) => res.data),
        catchError((erro) => {
          console.error('[AdminService] Falha ao acionar o worker:', erro.message);
          return of({ erro: 'Worker indisponível', candidatos: [], total: 0 });
        }),
      );
  }
}
