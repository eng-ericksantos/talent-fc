import { Controller, Get, Param, Query, Res, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { CategoriaJogador } from './player.schema';
import { PlayersService } from './players.service';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('proxy-image')
  @ApiOperation({
    summary: 'Proxy de imagens do CDN oficial da EA',
    description:
      'Repassa a requisição da foto do jogador forjando User-Agent/Accept para ' +
      'contornar a proteção de hotlinking do CDN oficial da EA.',
  })
  @ApiQuery({ name: 'eaId', required: true, description: 'ID numérico do jogador na EA (eaPlayerId)' })
  @ApiResponse({ status: 200, description: 'Binário da imagem com Content-Type original.' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada no CDN.' })
  async proxyImagem(@Query('eaId') eaId: string, @Res() res: FastifyReply): Promise<void> {
    const { buffer, contentType } = await this.playersService.buscarImagemProxy(eaId);
    res
      .header('Content-Type', contentType)
      .header('Cache-Control', 'public, max-age=86400')
      .code(200)
      .send(buffer);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar jogadores',
    description:
      'Retorna todos os jogadores ordenados por overall. ' +
      'Quando o parâmetro `search` é informado, filtra por nome, nacionalidade ou posição — ' +
      'ou, se o termo bater com uma lenda conhecida (ex: "zidane", "ronaldinho"), ativa o ' +
      'Modo Herdeiros da Lenda e retorna `legendMatched` com a chave da lenda ativada. ' +
      'Suporta filtros avançados: maxAge, minPot, maxPot, position e country.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Busca parcial por nome/nacionalidade/posição, ou o nome de uma lenda (zidane, ronaldinho, kante, ronaldo)' })
  @ApiQuery({ name: 'maxAge', required: false, description: 'Idade máxima do jogador (15-40)' })
  @ApiQuery({ name: 'minPot', required: false, description: 'Potencial mínimo do jogador (70-99)' })
  @ApiQuery({ name: 'maxPot', required: false, description: 'Potencial máximo do jogador (70-99)' })
  @ApiQuery({ name: 'position', required: false, description: 'Posição do jogador (ATA, MEI, DEF, GOL)' })
  @ApiQuery({ name: 'country', required: false, description: 'País/Nacionalidade do jogador' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página (padrão: 20)' })
  @ApiResponse({ status: 200, description: 'Objeto paginado { data, total, page, totalPages }.' })
  async listarTodos(
    @Query('search') query?: string,
    @Query('maxAge') maxAge?: string,
    @Query('minPot') minPot?: string,
    @Query('maxPot') maxPot?: string,
    @Query('position') position?: string,
    @Query('country') country?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const paginaNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    if (query) return this.playersService.search(query, paginaNum, limitNum, { maxAge, minPot, maxPot, position, country });
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
