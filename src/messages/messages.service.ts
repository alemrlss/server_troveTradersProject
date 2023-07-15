import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Messages } from './schema/messages.schema';
import { Model } from 'mongoose';
import { MessageDto } from './dto/messageCreate.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Messages.name) private messageModel: Model<Messages>,
  ) {}

  async createMessage(createMessageDto: MessageDto): Promise<Messages> {
    const createdMessage = new this.messageModel(createMessageDto);
    return createdMessage.save();
  }
  async getMessagesByTradeId(tradeId: string) {
    return this.messageModel.find({ tradeId }).exec();
  }
}
