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

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({})
  name: string;
  @Prop({}) // APELLIDO USUSARIO
  lastName: string;

  @Prop({ required: true }) //EMAIL USUARIO
  email: string;

  @Prop({ required: true }) //PASSWORD USUARIO
  password: string;

  @Prop({}) //USERNAME USUARIO
  username: string;

  @Prop({})
  phone: string;

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

  @Prop({})
  imageProfile: string;

  @Prop({ default: false })
  isVerify: boolean;
  @Prop([
    {
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
      target: { type: String },
    },
  ])
  notifications: {
    _id: ObjectId;
    message: string;
    createdAt: Date;
    read: boolean;
    target: string;
  }[];

  @Prop([
    {
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      sellerID: { type: String },
      buyerID: { type: String },
      postID: { type: String },
      nameBuyer: { type: String },
      nameSeller: { type: String },
      titlePost: { type: String },
      alerts: {
        type: [{ role: String, message: String, disputeId: String }],
        default: [],
      },
      deliverDate: { type: Date },
    },
  ])
  requests: {
    _id: ObjectId;
    message: string;
    createdAt: Date;
    sellerID: string;
    buyerID: string;
    postID: string;
    nameBuyer: string;
    nameSeller: string;
    titlePost: string;
    agreementConfirmationBuyer: boolean;
    agreementConfirmationSeller: boolean;
    payConfirmationBuyer: boolean;
    payConfirmationSeller: boolean;
    receivedConfirmationBuyer: boolean;
    receivedConfirmationSeller: boolean;
    isCancel: boolean;
    whoCanceled: string;
    inDispute: boolean;
    alerts: { role: string; message: string; disputeId: string }[];
    deliverDate: Date;
  }[];

  @Prop([
    {
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      sellerID: { type: String },
      buyerID: { type: String },
      postID: { type: String },
      nameBuyer: { type: String },
      nameSeller: { type: String },
      titlePost: { type: String },
      agreementConfirmationSeller: { type: Boolean, default: false },
      agreementConfirmationBuyer: { type: Boolean, default: false },
      payConfirmationBuyer: { type: Boolean, default: false },
      payConfirmationSeller: { type: Boolean, default: false },
      receivedConfirmationBuyer: { type: Boolean, default: false },
      receivedConfirmationSeller: { type: Boolean, default: false },
      isCancel: { type: Boolean, default: false },
      whoCanceled: { type: String },
      inDispute: { type: Boolean, default: false },
      alerts: {
        type: [{ role: String, message: String, disputeId: String }],
        default: [],
      },
      deliverDate: { type: Date },
    },
  ])
  trades: {
    _id: ObjectId;
    message: string;
    createdAt: Date;
    sellerID: string;
    buyerID: string;
    postID: string;
    nameBuyer: string;
    nameSeller: string;
    titlePost: string;
    agreementConfirmationSeller: boolean;
    agreementConfirmationBuyer: boolean;
    payConfirmationBuyer: boolean;
    payConfirmationSeller: boolean;
    receivedConfirmationBuyer: boolean;
    receivedConfirmationSeller: boolean;
    isCancel: boolean;
    whoCanceled: string;
    inDispute: boolean;
    alerts: { role: string; message: string; disputeId: string }[];
    deliverDate: Date;
  }[];

  @Prop([
    {
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      sellerID: { type: String },
      buyerID: { type: String },
      postID: { type: String },
      nameBuyer: { type: String },
      nameSeller: { type: String },
      titlePost: { type: String },
      payConfirmationBuyer: { type: Boolean, default: false },
      payConfirmationSeller: { type: Boolean, default: false },
      isCancel: { type: Boolean, default: false },
      whoCanceled: { type: String },
      inDispute: { type: String, default: false },
    },
  ])
  tradesFinished: {
    _id: ObjectId;
    message: string;
    createdAt: Date;
    sellerID: string;
    buyerID: string;
    postID: string;
    nameBuyer: string;
    nameSeller: string;
    titlePost: string;
  }[];

  @Prop()
  verificationToken: string;

  @Prop({ default: false })
  verificationEmail: boolean;

  @Prop({ default: false })
  blocked: boolean;

  @Prop({ default: null })
  imageDocument: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop([
    {
      rating: Number,
      comment: String,
      timestamp: Date,
    },
  ])
  ratings: Array<{ rating: number; comment: string; timestamp: Date }>;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
