import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JogadorDocument = HydratedDocument<Jogador>;

export type CategoriaJogador = 'wonderkid' | 'gem' | 'veteran' | 'legend';

@Schema({ timestamps: true, collection: 'jogadores' })
export class Jogador {
  @Prop({ required: true, unique: true, index: true })
  eaPlayerId: number;

  @Prop({ required: true })
  nome: string;

  @Prop({ required: true })
  idade: number;

  @Prop({ required: true })
  overall: number;

  @Prop({ required: true, index: true })
  potencial: number;

  @Prop({ required: true, index: true })
  posicao: string;

  @Prop({ required: true })
  nacionalidade: string;

  @Prop({ required: true })
  valorMercado: string;

  @Prop({ type: Object })
  atributos?: Record<string, number>;

  // Demais sub-atributos brutos da EA (defensiveAwareness, sprintSpeed, gkReflexes, etc.) — chaves em inglês (nomes originais da EA)
  @Prop({ type: Object })
  atributosEstendidos?: Record<string, number>;

  @Prop()
  matchPercentage?: number;

  @Prop({ required: true })
  resistencia: number;

  @Prop({ required: true })
  interceptacoes: number;

  @Prop({ required: true })
  ritmo: number;

  @Prop({ required: true })
  finalizacao: number;

  @Prop({ required: true })
  habilidades: number;

  @Prop({
    required: true,
    enum: ['wonderkid', 'gem', 'veteran', 'legend'],
  })
  categoria: CategoriaJogador;
}

export const JogadorSchema = SchemaFactory.createForClass(Jogador);

JogadorSchema.index({ nome: 'text', nacionalidade: 'text', posicao: 'text' });
JogadorSchema.index({ categoria: 1, overall: -1 });  // índice composto para findByCategory
JogadorSchema.index({ potencial: -1 });
