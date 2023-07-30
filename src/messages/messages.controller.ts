import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageDto } from './dto/messageCreate.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}
  @Post()
  @ApiOperation({ summary: 'Create message' })
  async createMessage(@Body() createMessageDto: MessageDto) {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get(':tradeId')
  @ApiOperation({ summary: 'Get message by tradeId' })
  async getMessagesByTradeId(@Param('tradeId') tradeId: string) {
    return this.messagesService.getMessagesByTradeId(tradeId);
  }
}
