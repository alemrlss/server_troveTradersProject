/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  //~MAP DE LOS USERS CONECTADOS
  userConnections = new Map<string, Socket>();

  //? ESTA FUNCION SE EJECUTA APENAS INICA EL SERVIDOR WEBSOCKETS.
  afterInit(server: any) {
    console.log('Esto se ejecuta cuando inicia');
  }

  //? Funcion se ejecuta cuando un cliente se conecta del websocket...
  handleConnection(client: Socket, ...args: any[]) {
    console.log('Alguien se ha conectado al servidor....');
    const userId: string = client.handshake.query.userId as string;
    this.userConnections.set(userId, client);
  }

  //? Funcion se ejecuta cuando un cliente se desconecta del websocket...
  handleDisconnect(client: Socket) {
    console.log('alguien se desconecto...');
    const userId: string = client.handshake.query.userId as string;
    this.userConnections.delete(userId);
  }
  //?ENVIAR NOTIFICACION CUANDO SE LE DA CLICK AL BOTON COMPRAR..
  @SubscribeMessage('notification')
  sendNotificationToUser(
    client: Socket,
    payload: { authorId: string; msgNotification: any, bgColor: string},
  ): void {
    const { authorId, msgNotification, bgColor } = payload;

    const userSocket = this.userConnections.get(authorId);
    if (userSocket) {
      userSocket.emit('newNotification', {msgNotification, bgColor});
    }
  }

  // !Abajo de aqui nada vale..
  // FUNCION PERSONALIZADA ( EN EL CLIENTE PARA COMUNICARLA DEBE TENER EL MISMO NOMBRE)
  @SubscribeMessage('mensajeCliente')
  handleMessage(client: Socket, payload: any) {
   
    // Enviar un mensaje al cliente
    this.server.emit(
      'mensajeServidor',
      '¡Hola soy nodeJS y la idea es que mis datos salgan al cliente!!',
    );
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { room: string; userName: string }) {
    client.join(payload.room); // El cliente se une a la sala especificada
    this.server.to(payload.room).emit('userJoined', payload.userName); // Notifica a los demás usuarios de la sala que un nuevo usuario se ha unido
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    // client.leave(room); // El cliente abandona la sala especificada
    this.server.to(room).emit('userLeft', client.id); // Notifica a los demás usuarios de la sala que un usuario ha abandonado
  }

  @SubscribeMessage('sendMessage')
  handleMessages(
    client: Socket,
    payload: { room: string; message: string; userName: string },
  ) {
    this.server
      .to(payload.room)
      .emit('newMessage', { user: payload.userName, message: payload.message }); // Envía el mensaje a todos los usuarios de la sala
  }
  // &  Notificaciones...

  sendNotificationToVendor(authorId: string, notification: any): void {
    this.server.to(authorId).emit('newNotification', notification);
  }
}
