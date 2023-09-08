/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DisputesDocument = HydratedDocument<Disputes>;

@Schema()
export class Disputes {
  @Prop()
  tradeId: string;
  @Prop()
  sellerId: string;
  @Prop()
  buyerId: string;
  @Prop()
  inDispute: boolean;
  @Prop()
  createdAt: Date;
  @Prop()
  titlePost: string;
  @Prop()
  nameBuyer: string;
  @Prop()
  nameSeller: string;
  @Prop()
  postID: string;
  @Prop()
  payConfirmationBuyer: boolean;
  @Prop()
  payConfirmationSeller: boolean;
  @Prop()
  receivedConfirmationBuyer: boolean;
  @Prop()
  receivedConfirmationSeller: boolean;
  @Prop()
  reason: string;
  @Prop()
  proofBuyer: string;
  @Prop()
  proofSeller: string;
  @Prop({ default: false })
  pruebaComprador: boolean;
  @Prop({
    type: [{ role: String, message: String, disputeId: String }],
    default: [],
  })
  alerts: { role: string; message: string; disputeId: string }[];
  @Prop({})
  deliverDate: Date;
}

export const DisputesSchema = SchemaFactory.createForClass(Disputes);
