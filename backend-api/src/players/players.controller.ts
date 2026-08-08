import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriaJogador } from './player.schema';
import { PlayersService } from './players.service';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar jogadores',
    description:
      'Retorna todos os jogadores ordenados por overall. ' +
      'Quando o parâmetro `search` é informado, filtra por nome, nacionalidade ou posição.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Texto para busca parcial por nome, nacionalidade ou posição',
  })
  @ApiResponse({ status: 200, description: 'Array de jogadores em JSON.' })
  async listarTodos(@Query('search') query?: string) {
    if (query) {
      return this.playersService.search(query);
    }
    return this.playersService.findAll();
  }

  @Get('categoria/:categoria')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({
    summary: 'Listar por categoria',
    description:
      'Retorna todos os jogadores de uma categoria específica ordenados por overall. ' +
      'Categorias válidas: wonderkid, gem, veteran, legend.',
  })
  @ApiParam({
    name: 'categoria',
    enum: ['wonderkid', 'gem', 'veteran', 'legend'],
    description: 'Categoria do jogador no Modo Carreira',
  })
  @ApiResponse({ status: 200, description: 'Array de jogadores da categoria em JSON.' })
  async listarPorCategoria(@Param('categoria') categoria: CategoriaJogador) {
    return this.playersService.findByCategory(categoria);
  }
}
