import { BadGatewayException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriaJogador, Jogador, JogadorDocument } from './player.schema';

export interface RespostaPaginada<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ImagemProxy {
  buffer: Buffer;
  contentType: string;
}

// Hosts liberados para o proxy — evita SSRF via URLs arbitrárias no query param
const HOSTS_PERMITIDOS = new Set(['cdn.sofifa.net', 'sofifa.com']);

const USER_AGENT_DISFARCADO =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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

  async buscarImagemProxy(url: string): Promise<ImagemProxy> {
    let alvo: URL;
    try {
      alvo = new URL(url);
    } catch {
      throw new HttpException('URL de imagem inválida.', HttpStatus.BAD_REQUEST);
    }

    if (!HOSTS_PERMITIDOS.has(alvo.hostname)) {
      throw new HttpException('Host de imagem não permitido.', HttpStatus.BAD_REQUEST);
    }

    // CDN migrou os caminhos de imagem da temporada 25 para 26
    const updatedUrl = alvo.toString().replace(/\/25_/g, '/26_');

    const response = await fetch(updatedUrl, {
      headers: {
        Referer: 'https://sofifa.com/',
        'User-Agent': USER_AGENT_DISFARCADO,
        Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundException('Imagem não encontrada no CDN');
      }
      throw new BadGatewayException(
        `Falha ao buscar imagem no CDN (status ${response.status}).`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? 'image/png';
    return { buffer, contentType };
  }
}
