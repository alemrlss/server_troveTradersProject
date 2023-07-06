/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppGateway } from './websockets.controller';

@Module({
  providers: [AppGateway],
})
export class WebSocketModule {}
