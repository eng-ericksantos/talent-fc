import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { Jogador, JogadorSchema } from './player.schema';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jogador.name, schema: JogadorSchema },
    ]),
    CacheModule.register({ ttl: 60_000 }),  // TTL em ms — cache-manager v7
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
