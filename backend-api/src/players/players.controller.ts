import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
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
  @ApiQuery({ name: 'search', required: false, description: 'Busca parcial por nome, nacionalidade ou posição' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página (padrão: 20)' })
  @ApiResponse({ status: 200, description: 'Objeto paginado { data, total, page, totalPages }.' })
  async listarTodos(
    @Query('search') query?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const paginaNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    if (query) return this.playersService.search(query, paginaNum, limitNum);
    return this.playersService.findAll(paginaNum, limitNum);
  }

  @Get('categoria/:categoria')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({
    summary: 'Listar por categoria',
    description:
      'Retorna jogadores de uma categoria paginados e ordenados por overall. ' +
      'Categorias válidas: wonderkid, gem, veteran, legend.',
  })
  @ApiParam({ name: 'categoria', enum: ['wonderkid', 'gem', 'veteran', 'legend'], description: 'Categoria do jogador' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página (padrão: 20)' })
  @ApiResponse({ status: 200, description: 'Objeto paginado { data, total, page, totalPages }.' })
  async listarPorCategoria(
    @Param('categoria') categoria: CategoriaJogador,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const paginaNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.playersService.findByCategory(categoria, paginaNum, limitNum);
  }
}
