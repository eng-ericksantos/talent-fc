import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  LEGEND_PROFILES, 
  PerfilLenda, 
  normalizarCampoPerfil, 
  resolverCaminhoAtributo,
  resolverTodosCaminhos 
} from './constants/legend-profiles.constant';
import { CategoriaJogador, Jogador, JogadorDocument } from './player.schema';

export interface RespostaPaginada<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  legendMatched?: string;
}

export interface ImagemProxy {
  buffer: Buffer;
  contentType: string;
}

// Campos do perfil que não representam um limiar de atributo (não entram no filtro/score genérico)
const CAMPOS_NAO_ATRIBUTO = new Set(['nome', 'positions', 'maxAge']);

// Corrente de CDNs reais testados em ordem de probabilidade de sucesso
const CDN_URLS_FALLBACK: ((eaId: string) => string)[] = [
  (eaId) => `https://cdn.futwiz.com/assets/img/fc26/faces/${eaId}.png`,
  (eaId) => `https://cdn.futwiz.com/assets/img/fc25/faces/${eaId}.png`,
  (eaId) => `https://cdn.sofifa.net/players/${eaId}/26_240.png`,
  (eaId) => `https://cdn.sofifa.net/players/${eaId}/25_240.png`,
];

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
    filtros?: { maxAge?: string; minPot?: string; position?: string },
  ): Promise<RespostaPaginada<JogadorDocument>> {
    const chaveLenda = query.trim().toLowerCase();
    const perfilLenda = LEGEND_PROFILES[chaveLenda];
    if (perfilLenda) {
      return this.buscarPorLenda(perfilLenda, page, limit);
    }

    const filtro: any = {
      $or: [
        { nome: { $regex: query, $options: 'i' } },
        { nacionalidade: { $regex: query, $options: 'i' } },
        { posicao: { $regex: query, $options: 'i' } },
      ],
    };

    // Aplicar filtros avançados
    if (filtros) {
      if (filtros.maxAge) {
        filtro['idade'] = { $lte: Number(filtros.maxAge) };
      }
      if (filtros.minPot) {
        filtro['potencial'] = { $gte: Number(filtros.minPot) };
      }
      if (filtros.position && filtros.position.trim()) {
        filtro['posicao'] = filtros.position.toUpperCase();
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.jogadorModel.find(filtro).sort({ overall: -1 }).skip(skip).limit(limit).exec(),
      this.jogadorModel.countDocuments(filtro),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  // "Modo Herdeiros da Lenda" — filtra pelo perfil estatístico da lenda e pontua a proximidade de cada jogador.
  // Genérico: adicionar uma nova lenda exige apenas editar constants/legend-profiles.constant.ts.
  private async buscarPorLenda(
    perfil: PerfilLenda,
    page: number,
    limit: number,
  ): Promise<RespostaPaginada<JogadorDocument>> {
    const filtro = this.montarFiltroLenda(perfil);

    const skip = (page - 1) * limit;
    const [candidatos, total] = await Promise.all([
      this.jogadorModel.find(filtro).sort({ overall: -1 }).skip(skip).limit(limit).exec(),
      this.jogadorModel.countDocuments(filtro),
    ]);

    const data = candidatos.map((jogador) => ({
      ...jogador.toObject(),
      matchPercentage: this.calcularMatchLenda(jogador, perfil),
    }));

    return {
      data: data as unknown as JogadorDocument[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
      legendMatched: perfil.nome,
    };
  }

  private montarFiltroLenda(perfil: PerfilLenda): Record<string, unknown> {
    // Começa com filtro de posição
    const condicoesBase: any[] = [
      { posicao: { $in: perfil.positions } },
    ];
    
    if (perfil.maxAge) {
      condicoesBase.push({ idade: { $lte: perfil.maxAge } });
    }

    // Para cada atributo da lenda, cria condição com fallback automático
    for (const [chave, valor] of Object.entries(perfil)) {
      if (!['nome', 'positions', 'maxAge', 'skillMoves'].includes(chave) && valor !== undefined) {
        const caminhosPossiveis = resolverTodosCaminhos(normalizarCampoPerfil(chave));
        
        if (caminhosPossiveis.length === 1) {
          // Se houver apenas um caminho, usa diretamente
          condicoesBase.push({
            [caminhosPossiveis[0]]: { $gte: valor },
          });
        } else {
          // Se houver múltiplos caminhos, cria $or (fallback automático)
          condicoesBase.push({
            $or: caminhosPossiveis.map((caminho) => ({
              [caminho]: { $gte: valor },
            })),
          });
        }
      }
    }

    // Combina todas as condições com $and (todas devem ser satisfeitas)
    return condicoesBase.length === 1 
      ? condicoesBase[0] 
      : { $and: condicoesBase };
  }

  // Distância euclidiana normalizada (0-100) entre os atributos do jogador e o perfil da lenda
  private calcularMatchLenda(jogador: JogadorDocument, perfil: PerfilLenda): number {
    const documento = jogador.toObject() as unknown as Record<string, unknown>;
    const pares: [number, number][] = [];

    for (const [chave, valor] of Object.entries(perfil)) {
      if (CAMPOS_NAO_ATRIBUTO.has(chave) || valor === undefined) continue;
      
      const campoPerfil = normalizarCampoPerfil(chave);
      const caminhosPossiveis = resolverTodosCaminhos(campoPerfil);
      
      // Tenta obter o valor usando fallback strategy
      const atual = this.obterAtributoComFallback(documento, caminhosPossiveis) ?? 0;
      pares.push([atual, valor as number]);
    }

    if (pares.length === 0) return 100;

    const distancia = Math.sqrt(pares.reduce((soma, [atual, alvo]) => soma + (atual - alvo) ** 2, 0));
    const distanciaMaxima = Math.sqrt(pares.length) * 100;
    return Math.round(Math.max(0, 100 - (distancia / distanciaMaxima) * 100) * 100) / 100;
  }

  private obterPorCaminho(objeto: Record<string, unknown>, caminho: string): number | undefined {
    return caminho.split('.').reduce<unknown>(
      (atual, chave) => (atual as Record<string, unknown> | undefined)?.[chave],
      objeto,
    ) as number | undefined;
  }

  /**
   * Obtém valor de um atributo tentando múltiplos caminhos possíveis (fallback strategy)
   * Se não encontrar em um caminho, tenta o próximo
   */
  private obterAtributoComFallback(
    objeto: Record<string, unknown>,
    caminhosPossiveis: string[],
  ): number | undefined {
    for (const caminho of caminhosPossiveis) {
      const valor = this.obterPorCaminho(objeto, caminho);
      if (valor !== undefined && valor !== null && valor !== 0) {
        return valor;
      }
    }
    return undefined;
  }

  async buscarImagemProxy(eaId: string): Promise<ImagemProxy> {
    // Apenas dígitos — evita injeção de host/caminho arbitrário na URL do CDN
    if (!/^\d+$/.test(eaId)) {
      throw new BadRequestException('eaId inválido.');
    }

    for (const construirUrl of CDN_URLS_FALLBACK) {
      const response = await fetch(construirUrl(eaId), {
        headers: {
          'User-Agent': USER_AGENT_DISFARCADO,
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') ?? 'image/png';
        return { buffer, contentType };
      }
    }

    throw new NotFoundException('Imagem não encontrada em nenhum CDN da corrente de fallback.');
  }
}
