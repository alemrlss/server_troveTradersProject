/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Messages extends Document {
  @Prop({ required: true })
  tradeId: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  username: string;
}

export const MessagesSchema = SchemaFactory.createForClass(Messages);
