/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type PostsDocument = HydratedDocument<Posts>;
export enum PostState {
  DISPONIBLE = 'disponible',
  ACUERDO = 'acuerdo',
  PAGO = 'pago',
  RECIBO = 'recibo',
  FINALIZADO = 'finalizado',
}
@Schema()
export class Posts {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: string;

  @Prop()
  photos: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
  author_id: Types.ObjectId;

  @Prop({ default: PostState.DISPONIBLE })
  currentState: PostState;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);
