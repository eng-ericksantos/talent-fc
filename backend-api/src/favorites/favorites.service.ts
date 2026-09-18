import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorito, FavoritoDocument } from './favorites.schema';

@Injectable()
export class FavoritesService {
  constructor(@InjectModel(Favorito.name) private favoritoModel: Model<FavoritoDocument>) {}

  async buscarFavoritosPorUsuario(userId: string): Promise<Favorito[]> {
    if (!userId) {
      throw new BadRequestException('userId é obrigatório');
    }

    return this.favoritoModel.find({ userId }).sort({ createdAt: -1 });
  }

  async adicionarFavorito(
    userId: string,
    eaPlayerId: number,
    jogadorNome?: string,
  ): Promise<Favorito> {
    if (!userId) {
      throw new BadRequestException('userId é obrigatório');
    }

    if (!eaPlayerId || eaPlayerId <= 0) {
      throw new BadRequestException('eaPlayerId inválido');
    }

    const favorito = new this.favoritoModel({
      userId,
      eaPlayerId,
      jogadorNome,
    });

    return favorito.save();
  }

  async removerFavorito(userId: string, eaPlayerId: number): Promise<{ deletedCount: number }> {
    if (!userId) {
      throw new BadRequestException('userId é obrigatório');
    }

    if (!eaPlayerId || eaPlayerId <= 0) {
      throw new BadRequestException('eaPlayerId inválido');
    }

    const resultado = await this.favoritoModel.deleteOne({ userId, eaPlayerId });

    return { deletedCount: resultado.deletedCount };
  }

  async verificarFavorito(userId: string, eaPlayerId: number): Promise<boolean> {
    if (!userId || !eaPlayerId) {
      throw new BadRequestException('userId e eaPlayerId são obrigatórios');
    }

    const favorito = await this.favoritoModel.findOne({ userId, eaPlayerId });
    return !!favorito;
  }
}
