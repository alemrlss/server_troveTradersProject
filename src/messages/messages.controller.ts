import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageDto } from './dto/messageCreate.dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}
  @Post()
  async createMessage(@Body() createMessageDto: MessageDto) {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get(':tradeId')
  async getMessagesByTradeId(@Param('tradeId') tradeId: string) {
    return this.messagesService.getMessagesByTradeId(tradeId);
  }
}
