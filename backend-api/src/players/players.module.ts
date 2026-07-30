import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Jogador, JogadorSchema } from './player.schema';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jogador.name, schema: JogadorSchema },
    ]),
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
