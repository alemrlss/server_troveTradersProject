/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppGateway } from './websockets.controller';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [MessagesModule],
  providers: [AppGateway],
})
export class WebSocketModule {}
