/* eslint-disable prettier/prettier */
import { ObjectId } from 'mongoose';

export class UpdateRequestDto {
  readonly message: string;
  readonly createdAt: Date;
  readonly isResolved: boolean;
  readonly isCheck: boolean;
  sellerID: string;
  buyerID: string;
  postID: string;
  _id: ObjectId;
  nameBuyer: string;
  nameSeller: string;
  titlePost: string;
}
