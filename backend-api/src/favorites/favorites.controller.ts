import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FirebaseAuthGuard } from '../admin/firebase-auth.guard';
import { DecodedIdToken } from 'firebase-admin/auth';

interface RequestComUsuario extends Request {
  usuario: DecodedIdToken;
}

@ApiTags('Favoritos')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(FirebaseAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar favoritos do usuário',
    description: 'Retorna todos os jogadores marcados como favoritos pelo usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Favoritos encontrados' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async buscarFavoritos(@Req() req: RequestComUsuario) {
    const userId = req.usuario.uid;
    return this.favoritesService.buscarFavoritosPorUsuario(userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Adicionar jogador aos favoritos',
    description: 'Adiciona um jogador ao list de favoritos do usuário autenticado.',
  })
  @ApiResponse({ status: 201, description: 'Favorito adicionado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 400, description: 'Validação falhou - eaPlayerId é obrigatório e deve ser um número positivo' })
  async adicionarFavorito(
    @Req() req: RequestComUsuario,
    @Body() criarFavoritoDto: CreateFavoriteDto,
  ) {
    const userId = req.usuario.uid;
    return this.favoritesService.adicionarFavorito(userId, criarFavoritoDto.eaPlayerId, criarFavoritoDto.jogadorNome);
  }

  @Delete(':eaPlayerId')
  @ApiOperation({
    summary: 'Remover jogador dos favoritos',
    description: 'Remove um jogador da list de favoritos do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Favorito removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async removerFavorito(@Req() req: RequestComUsuario, @Param('eaPlayerId') eaPlayerId: string) {
    const userId = req.usuario.uid;
    return this.favoritesService.removerFavorito(userId, parseInt(eaPlayerId, 10));
  }

  @Get('check/:eaPlayerId')
  @ApiOperation({
    summary: 'Verificar se jogador é favorito',
    description: 'Verifica se um jogador específico está nos favoritos do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Status retornado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async verificarFavorito(@Req() req: RequestComUsuario, @Param('eaPlayerId') eaPlayerId: string) {
    const userId = req.usuario.uid;
    const isFavorito = await this.favoritesService.verificarFavorito(userId, parseInt(eaPlayerId, 10));
    return { isFavorito };
  }
}
