import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FavoritoDocument = HydratedDocument<Favorito>;

@Schema({ timestamps: true, collection: 'favoritos' })
export class Favorito {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  eaPlayerId: number;

  @Prop({ required: false })
  jogadorNome?: string;
}

export const FavoritoSchema = SchemaFactory.createForClass(Favorito);

// Índice composto para garantir unicidade por usuário e jogador
FavoritoSchema.index({ userId: 1, eaPlayerId: 1 }, { unique: true });
