import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriaJogador, Jogador, JogadorDocument } from './player.schema';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Jogador.name)
    private readonly jogadorModel: Model<JogadorDocument>,
  ) {}

  async findAll(): Promise<JogadorDocument[]> {
    return this.jogadorModel.find().sort({ overall: -1 }).exec();
  }

  async findByCategory(categoria: CategoriaJogador): Promise<JogadorDocument[]> {
    return this.jogadorModel
      .find({ categoria })
      .sort({ overall: -1 })
      .exec();
  }

  async search(query: string): Promise<JogadorDocument[]> {
    return this.jogadorModel
      .find({
        $or: [
          { nome: { $regex: query, $options: 'i' } },
          { nacionalidade: { $regex: query, $options: 'i' } },
          { posicao: { $regex: query, $options: 'i' } },
        ],
      })
      .sort({ overall: -1 })
      .exec();
  }
}
