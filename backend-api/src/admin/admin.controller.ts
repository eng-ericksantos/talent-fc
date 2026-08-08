import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('trigger-worker')
  @ApiOperation({
    summary: 'Acionar motor de dados',
    description:
      'Dispara o worker Python sob demanda: executa o seed, ' +
      'calcula a similaridade "Novo Zidane" e persiste os resultados no MongoDB.',
  })
  @ApiResponse({ status: 201, description: 'Candidatos processados com sucesso.' })
  @ApiResponse({ status: 503, description: 'Worker indisponível.' })
  dispararWorker() {
    return this.adminService.dispararWorker();
  }
}
