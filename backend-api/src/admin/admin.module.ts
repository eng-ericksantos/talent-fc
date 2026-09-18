import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { Jogador, JogadorSchema } from '../players/player.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Jogador.name, schema: JogadorSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
