import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriaJogador, Jogador, JogadorDocument } from './player.schema';

export interface RespostaPaginada<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Jogador.name)
    private readonly jogadorModel: Model<JogadorDocument>,
  ) {}

  async findAll(page = 1, limit = 20): Promise<RespostaPaginada<JogadorDocument>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.jogadorModel.find().sort({ overall: -1 }).skip(skip).limit(limit).exec(),
      this.jogadorModel.countDocuments(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByCategory(
    categoria: CategoriaJogador,
    page = 1,
    limit = 20,
  ): Promise<RespostaPaginada<JogadorDocument>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.jogadorModel.find({ categoria }).sort({ overall: -1 }).skip(skip).limit(limit).exec(),
      this.jogadorModel.countDocuments({ categoria }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async search(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<RespostaPaginada<JogadorDocument>> {
    const filtro = {
      $or: [
        { nome: { $regex: query, $options: 'i' } },
        { nacionalidade: { $regex: query, $options: 'i' } },
        { posicao: { $regex: query, $options: 'i' } },
      ],
    };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.jogadorModel.find(filtro).sort({ overall: -1 }).skip(skip).limit(limit).exec(),
      this.jogadorModel.countDocuments(filtro),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }
}
