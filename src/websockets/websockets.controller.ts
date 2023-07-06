/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(81, {
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  connectionsCount: number = 0;

  afterInit(server: any) {
    console.log('Esto se ejecuta cuando inicia');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Hola alguien se conecto al socket...' + client.id);
    this.connectionsCount++;

    this.server.emit('connections', `${this.connectionsCount}`);
  }

  handleDisconnect(client: Socket) {
    console.log('alguien se desconecto...');
    this.connectionsCount--;
    this.server.emit('connections', `${this.connectionsCount}`);
  }

  @SubscribeMessage('mensajeCliente')
  handleMessage(client: Socket, payload: any) {
    console.log('Mensaje recibido del cliente:', payload);
    // Enviar un mensaje al cliente
    this.server.emit(
      'mensajeServidor',
      '¡Hola soy nodeJS y la idea es que mis datos salgan al cliente!!',
    );
  }
}
