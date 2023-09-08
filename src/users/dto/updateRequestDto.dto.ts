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
  agreementConfirmationSeller: boolean;
  agreementConfirmationBuyer: boolean;
  payConfirmationBuyer: boolean;
  payConfirmationSeller: boolean;
  receivedConfirmationBuyer: boolean;
  receivedConfirmationSeller: boolean;
  isCancel: boolean;
  whoCanceled: string;
  inDispute: boolean;
  alerts: [];
  deliverDate: Date;
}
