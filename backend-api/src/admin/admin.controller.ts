import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AdminGuard } from './admin.guard';
import { FastifyRequest } from 'fastify';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('trigger-worker')
  @UseGuards(FirebaseAuthGuard)
  @ApiSecurity('bearer')
  @ApiOperation({
    summary: 'Acionar motor de dados',
    description:
      'Dispara o worker Python sob demanda: carrega o dataset oficial da EA, ' +
      'calcula a similaridade "Novo Zidane" e persiste os resultados no MongoDB.',
  })
  @ApiResponse({ status: 201, description: 'Candidatos processados com sucesso.' })
  @ApiResponse({ status: 503, description: 'Worker indisponível.' })
  dispararWorker() {
    return this.adminService.dispararWorker();
  }

  @Post('upload-csv')
  @UseGuards(AdminGuard)
  @ApiSecurity('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de CSV com normalização e bulkWrite',
    description:
      'Recebe um arquivo CSV de diferentes fontes (Kaggle), normaliza os nomes das colunas dinamicamente ' +
      'e executa um Upsert Inteligente (bulkWrite) no MongoDB sem sobrescrever atributos faltantes.',
  })
  @ApiResponse({
    status: 201,
    description: 'CSV processado e jogadores upsertados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Arquivo CSV inválido ou vazio.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async uploadCSV(@Req() request: FastifyRequest): Promise<any> {
    try {
      const data = await request.file();

      if (!data) {
        throw new BadRequestException('Nenhum arquivo fornecido.');
      }

      // Extrai o buffer do arquivo
      const buffer = await data.toBuffer();

      if (!buffer || buffer.length === 0) {
        throw new BadRequestException('Arquivo CSV vazio.');
      }

      return this.adminService.processarUploadCSV(buffer);
    } catch (erro) {
      if (erro instanceof BadRequestException) {
        throw erro;
      }
      throw new BadRequestException(
        `Erro ao processar arquivo: ${erro.message || 'Erro desconhecido'}`,
      );
    }
  }

  @Get('backups')
  @UseGuards(AdminGuard)
  @ApiSecurity('bearer')
  @ApiOperation({
    summary: 'Listar arquivos de backup disponíveis',
    description:
      'Retorna uma lista de arquivos CSV disponíveis no diretório de backups (data-worker/data) ' +
      'para restauração de dados em caso de atualizações falhas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de backups disponíveis',
    schema: {
      type: 'object',
      properties: {
        sucesso: { type: 'boolean' },
        backups: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async listarBackups(): Promise<any> {
    return this.adminService.listarBackups();
  }

  @Post('restore-backup')
  @UseGuards(AdminGuard)
  @ApiSecurity('bearer')
  @ApiOperation({
    summary: 'Restaurar dados a partir de um backup local',
    description:
      'Restaura o banco de dados MongoDB utilizando um arquivo CSV fixo no repositório. ' +
      'Reutiliza a mesma lógica de normalização e Smart Upsert do upload de CSV.',
  })
  @ApiResponse({
    status: 201,
    description: 'Backup restaurado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Arquivo de backup inválido ou não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas administradores.' })
  async restaurarBackup(@Body() body: { filename: string }): Promise<any> {
    if (!body.filename) {
      throw new BadRequestException('Nome do arquivo de backup é obrigatório.');
    }
    return this.adminService.restaurarBackup(body.filename);
  }
}
