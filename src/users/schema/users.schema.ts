/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, ObjectId, Types } from 'mongoose';
import { Posts } from 'src/posts/schema/posts.schema';

export type UsersDocument = HydratedDocument<Users>;

export enum Genders {
  Female = 'female',
  Male = 'male',
  Unknown = 'unknown',
}

export enum Roles {
  Admin = 'admin',
  User = 'user',
}

@Schema()
export class Users {
  @Prop({ type: SchemaTypes.ObjectId }) //ID USUARIO
  id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true }) //USERNAME USUARIO
  username: string;

  @Prop({ required: true }) // APELLIDO USUSARIO
  lastName: string;

  @Prop({ required: true, unique: true }) //EMAIL USUARIO
  email: string;

  @Prop({ required: true }) //PASSWORD USUARIO
  password: string;

  @Prop({
    //GENERO USUARIO
    type: String,
    enum: Genders,
    default: Genders.Unknown,
  })
  gender: string;

  @Prop({ enum: Roles, default: Roles.User }) //ROL USUARIO
  role: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Posts' }] })
  posts: Posts[];

  @Prop({ default: false })
  isVerify: boolean;

  @Prop({ default: 'defaultProfile.png' })
  imageProfile: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
