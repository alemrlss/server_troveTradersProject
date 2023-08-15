/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, ObjectId } from 'mongoose';

export type AdminsDocument = HydratedDocument<Admins>;

@Schema()
export class Admins {
  @Prop({ type: SchemaTypes.ObjectId }) //ID USUARIO
  id: ObjectId;

  @Prop({})
  name: string;

  @Prop({})
  lastName: string;

  @Prop({ required: true }) //EMAIL ADMNIN
  email: string;

  @Prop({ required: true }) //PASSWORD ADMIN
  password: string;

  @Prop({ default: false })
  isAdminPlus: boolean;
}

export const AdminsSchema = SchemaFactory.createForClass(Admins);
