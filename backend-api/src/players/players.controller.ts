import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriaJogador } from './player.schema';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  async listarTodos(@Query('search') query?: string) {
    if (query) {
      return this.playersService.search(query);
    }
    return this.playersService.findAll();
  }

  @Get('categoria/:categoria')
  async listarPorCategoria(@Param('categoria') categoria: CategoriaJogador) {
    return this.playersService.findByCategory(categoria);
  }
}
