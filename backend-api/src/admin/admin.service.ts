import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador, CategoriaJogador } from '../players/player.schema';
import { catchError, map, of } from 'rxjs';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { normalizarNomeAtributo, extrairAtributosEstendidos } from '../players/constants/attribute-aliases.constant';

@Injectable()
export class AdminService {
  private readonly workerUrl: string;

  // Dicionário de alias de colunas para normalização
  private readonly colunasMapeamento = {
    eaPlayerId: ['id', 'ID', 'player_id', 'playerId', 'eaPlayerId'],
    nome: ['commonName', 'name', 'Nome', 'player_name', 'playerName'],
    idade: ['age', 'Age', 'idade'],
    overall: ['overallRating', 'OVR', 'overall', 'Overall'],
    potencial: ['potential', 'POT', 'potencial'],
    posicao: ['position', 'Position', 'pos', 'posicao'],
    nacionalidade: ['nationality', 'Nationality', 'nacionalidade', 'nation'],
    valorMercado: ['marketValue', 'market_value', 'valor', 'valorMercado'],
    resistencia: ['stamina', 'Stamina', 'resistencia'],
    interceptacoes: ['interceptions', 'Interceptions', 'interceptacoes'],
    ritmo: ['pace', 'Pace', 'ritmo'],
    finalizacao: ['shooting', 'Shooting', 'finalizacao'],
    habilidades: ['dribbling', 'Dribbling', 'habilidades', 'skill'],
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Jogador.name) private jogadorModel: Model<Jogador>,
  ) {
    this.workerUrl = this.configService.get<string>(
      'DATA_WORKER_URL',
      'http://talentfc_data_worker:8000',
    );
  }

  dispararWorker() {
    return this.httpService
      .post(`${this.workerUrl}/run-etl`)
      .pipe(
        map((res) => res.data),
        catchError((erro) => {
          console.error('[AdminService] Falha ao acionar o worker:', erro.message);
          return of({ erro: 'Worker indisponível', candidatos: [], total: 0 });
        }),
      );
  }

  /**
   * Encontra a chave normalizada da coluna no CSV baseado nos aliases
   */
  private encontrarColunaOriginal(
    nomeCSV: string,
    chaveNormalizada: string,
  ): boolean {
    const aliases = this.colunasMapeamento[chaveNormalizada] || [];
    return aliases.some(
      (alias) => alias.toLowerCase() === nomeCSV.toLowerCase(),
    );
  }

  /**
   * Normaliza o cabeçalho do CSV para as chaves esperadas
   */
  private normalizarCabecalho(cabecalhoCSV: string[]): string[] {
    return cabecalhoCSV.map((coluna) => {
      for (const [chaveNormalizada, aliases] of Object.entries(
        this.colunasMapeamento,
      )) {
        if (this.encontrarColunaOriginal(coluna, chaveNormalizada)) {
          return chaveNormalizada;
        }
      }
      // Retorna a coluna como está se não encontrar mapeamento
      return coluna;
    });
  }

  /**
   * Estima o potencial baseado na idade (conforme lógica do data-worker)
   */
  private estimarPotencial(idade: number, overall: number): number {
    const margem = Math.max(0, 23 - idade) * 2;
    return Math.min(99, overall + margem);
  }

  /**
   * Determina a categoria do jogador (wonderkid, gem, veteran)
   * Lógica replicada do data-worker (Python)
   */
  private inferirCategoria(
    idade: number,
    overall: number,
    potencial: number,
  ): CategoriaJogador {
    // Ordem importa: primeira regra que bater é a categoria
    if (idade <= 21 && potencial >= 80) return 'wonderkid';
    if (idade <= 27 && overall < potencial - 5) return 'gem';
    if (idade >= 32 && overall >= 80) return 'veteran';
    return 'gem'; // Padrão
  }

  /**
   * Estima o valor de mercado baseado no overall e potencial
   * Lógica replicada exatamente do data-worker (Python)
   */
  private estimarValorMercado(overall: number, potencial: number): string {
    const base = Math.max(1, (overall - 60) * 3);
    const bonusJuventude = (potencial - overall) * 2;
    return `€${base + bonusJuventude}M`;
  }

  /**
   * Transforma linhas do CSV em objetos Jogador normalizados
   * Com suporte a múltiplos formatos de CSV e normalização inteligente de atributos
   */
  private normalizarLinhas(
    dados: Record<string, any>[],
  ): Partial<Jogador>[] {
    return dados.map((linha) => {
      const jogador: Partial<Jogador> = {};
      let idade: number | undefined;
      let overall: number | undefined;

      // Separa campos conhecidos dos atributos estendidos
      const atributosEstendidosBrutos: Record<string, any> = {};

      // Mapeia cada campo da linha para o objeto jogador
      for (const [chave, valor] of Object.entries(linha)) {
        if (valor === null || valor === undefined || valor === '') {
          continue;
        }

        // Se a chave já está normalizada (está no mapeamento)
        if (this.colunasMapeamento[chave]) {
          if (
            chave === 'eaPlayerId' ||
            chave === 'idade' ||
            chave === 'overall' ||
            chave === 'potencial' ||
            chave === 'resistencia' ||
            chave === 'interceptacoes' ||
            chave === 'ritmo' ||
            chave === 'finalizacao' ||
            chave === 'habilidades'
          ) {
            const valor_int = parseInt(valor, 10);
            jogador[chave] = valor_int;
            
            // Captura idade e overall para calcular categoria depois
            if (chave === 'idade') idade = valor_int;
            if (chave === 'overall') overall = valor_int;
          } else {
            jogador[chave] = valor.toString();
          }
        } else {
          // Tenta normalizar como atributo estendido (com fallback fuzzy matching)
          atributosEstendidosBrutos[chave] = valor;
        }
      }

      // Extrai e normaliza atributos estendidos com suporte a múltiplos formatos
      const atributosEstendidos = extrairAtributosEstendidos(atributosEstendidosBrutos);
      if (Object.keys(atributosEstendidos).length > 0) {
        jogador.atributosEstendidos = atributosEstendidos;
      }

      // Calcula categoria baseado em idade/overall/potencial
      if (idade !== undefined && overall !== undefined) {
        const potencial = jogador.potencial ?? this.estimarPotencial(idade, overall);
        jogador.potencial = potencial;
        jogador.valorMercado = jogador.valorMercado ?? this.estimarValorMercado(overall, potencial);
        jogador.categoria = this.inferirCategoria(idade, overall, potencial as number);
      }

      return jogador;
    });
  }

  /**
   * Faz o upload e processa um arquivo CSV
   */
  async processarUploadCSV(buffer: Buffer): Promise<any> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Arquivo CSV vazio.');
    }

    try {
      // Parse do CSV
      const conteudo = buffer.toString('utf-8');
      const dados = parse(conteudo, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
      }) as Record<string, any>[];

      if (dados.length === 0) {
        throw new BadRequestException('CSV contém 0 linhas de dados.');
      }

      // Normaliza os cabeçalhos
      const cabecalhoOriginal = Object.keys(dados[0]);
      const cabecalhoNormalizado = this.normalizarCabecalho(cabecalhoOriginal);

      // Reconstrói os dados com cabeçalho normalizado
      const dadosNormalizados = dados.map((linha) => {
        const novaLinha: Record<string, any> = {};
        cabecalhoOriginal.forEach((colOrig, idx) => {
          novaLinha[cabecalhoNormalizado[idx]] = linha[colOrig];
        });
        return novaLinha;
      });

      // Transforma em objetos Jogador
      const jogadores = this.normalizarLinhas(dadosNormalizados);

      // Filtra apenas jogadores com eaPlayerId válido
      const jogadoresValidos = jogadores.filter(
        (j) => j.eaPlayerId && j.eaPlayerId > 0,
      );

      if (jogadoresValidos.length === 0) {
        throw new BadRequestException(
          'Nenhum jogador válido encontrado no CSV.',
        );
      }

      // Cria operações de bulkWrite
      const operacoesBulk = jogadoresValidos.map((jogador) => ({
        updateOne: {
          filter: { eaPlayerId: jogador.eaPlayerId },
          update: { $set: jogador },
          upsert: true,
        },
      }));

      // Executa bulkWrite
      const resultado = await this.jogadorModel.bulkWrite(operacoesBulk);

      return {
        sucesso: true,
        mensagem: `${jogadoresValidos.length} jogadores processados com sucesso.`,
        totalLinhasCSV: dados.length,
        totalJogadoresValidos: jogadoresValidos.length,
        operacoes: {
          insercoes: resultado.upsertedCount,
          atualizacoes: resultado.modifiedCount,
        },
      };
    } catch (erro) {
      if (erro instanceof BadRequestException) {
        throw erro;
      }
      console.error('[AdminService] Erro ao processar CSV:', erro);
      throw new BadRequestException(
        `Erro ao processar CSV: ${erro.message || 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Lista os arquivos CSV disponíveis no diretório de backups
   */
  async listarBackups(): Promise<any> {
    try {
      // Calcula o caminho para data-worker/data
      const backupDir = path.join(process.cwd(), '..', 'data-worker', 'data');

      console.log('[AdminService] Procurando backups em:', backupDir);

      // Verifica se o diretório existe
      if (!fs.existsSync(backupDir)) {
        console.warn(`[AdminService] Diretório de backups não encontrado: ${backupDir}`);
        return {
          sucesso: true,
          backups: [],
          mensagem: 'Diretório de backups não configurado ou vazio.',
        };
      }

      // Lê os arquivos do diretório
      const arquivos = await fs.promises.readdir(backupDir);
      console.log('[AdminService] Arquivos encontrados:', arquivos);

      // Filtra apenas arquivos .csv
      const csvFiles = arquivos.filter((arquivo) =>
        arquivo.toLowerCase().endsWith('.csv'),
      );

      console.log('[AdminService] Arquivos CSV filtrados:', csvFiles);

      return {
        sucesso: true,
        backups: csvFiles,
        totalBackups: csvFiles.length,
      };
    } catch (erro) {
      console.error('[AdminService] Erro ao listar backups:', erro);
      throw new BadRequestException(
        `Erro ao listar backups: ${erro.message || 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Restaura dados a partir de um arquivo de backup local
   * Reutiliza a mesma lógica de normalização e Smart Upsert do upload CSV
   */
  async restaurarBackup(filename: string): Promise<any> {
    try {
      // Validação básica do nome do arquivo
      if (!filename || filename.trim().length === 0) {
        throw new BadRequestException('Nome do arquivo de backup é obrigatório.');
      }

      // Sanitiza o nome do arquivo (previne path traversal)
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new BadRequestException('Nome de arquivo inválido.');
      }

      // Calcula o caminho completo do arquivo
      const backupDir = path.join(process.cwd(), '..', 'data-worker', 'data');
      const caminhoArquivo = path.join(backupDir, filename);

      // Verifica se o arquivo existe
      if (!fs.existsSync(caminhoArquivo)) {
        throw new BadRequestException(
          `Arquivo de backup não encontrado: ${filename}`,
        );
      }

      // Lê o arquivo
      const buffer = await fs.promises.readFile(caminhoArquivo);

      if (!buffer || buffer.length === 0) {
        throw new BadRequestException('Arquivo de backup está vazio.');
      }

      // Reutiliza a mesma lógica de processamento CSV
      const resultado = await this.processarUploadCSV(buffer);

      return {
        ...resultado,
        backup: filename,
        mensagem: `Backup "${filename}" restaurado com sucesso. ${resultado.mensagem}`,
      };
    } catch (erro) {
      if (erro instanceof BadRequestException) {
        throw erro;
      }
      console.error('[AdminService] Erro ao restaurar backup:', erro);
      throw new BadRequestException(
        `Erro ao restaurar backup: ${erro.message || 'Erro desconhecido'}`,
      );
    }
  }
}
