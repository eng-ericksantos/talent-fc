import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { Favorito, FavoritoSchema } from './favorites.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Favorito.name, schema: FavoritoSchema }])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
