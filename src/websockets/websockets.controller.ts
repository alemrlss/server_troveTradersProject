/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { MessagesService } from 'src/messages/messages.service';
import { MessageDto } from 'src/messages/dto/messageCreate.dto';

@WebSocketGateway(81, {
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesService: MessagesService) {}

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
    payload: {
      authorId: string;
      msgNotification: any;
      bgColor: string;
      target: string;
    },
  ): void {
    const { authorId, msgNotification, bgColor, target } = payload;

    const userSocket = this.userConnections.get(authorId);
    if (userSocket) {
      userSocket.emit('newNotification', { msgNotification, bgColor, target });
    }
  }

  @SubscribeMessage('joinTradeRoom')
  handleJoinTradeRoom(client: Socket, tradeId: string) {
    // Asociar el tradeId al cliente
    client.data.tradeId = tradeId;
    client.join(tradeId); // El cliente se une a la sala especificada
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { tradeId: string; message: string; username: string },
  ) {
    const { tradeId, message, username } = payload;
    const idUser = client.handshake.query.userId as string;

    const newMessage: MessageDto = {
      tradeId,
      senderId: idUser.toString(),
      message,
      username: username,
      createdAt: new Date(),
    };

    await this.messagesService.createMessage(newMessage);

    this.server.to(tradeId).emit('message', newMessage);
  }

  @SubscribeMessage('sellerConfirmed')
  handleSellerConfirmed(
    client: Socket,
    payload: { tradeId: string; message: string; messageLocalStorage: string },
  ) {
    // Aquí debes actualizar el estado del vendedor en la base de datos, marcarlo como confirmado
    // También puedes emitir un evento a todos los clientes en la sala del tradeId para informarles sobre la confirmación del vendedor
    // Por ejemplo:
    this.server.to(payload.tradeId).emit(`sellerConfirmed_${payload.tradeId}`, {
      message: payload.message,
      messageLocalStorage: payload.messageLocalStorage,
    });
  }

  @SubscribeMessage('buyerConfirmed')
  handleBuyerConfirmed(
    client: Socket,
    payload: { tradeId: string; message: string; messageLocalStorage: string },
  ) {
    // Aquí debes actualizar el estado del comprador en la base de datos, marcarlo como confirmado
    // También puedes emitir un evento a todos los clientes en la sala del tradeId para informarles sobre la confirmación del comprador
    // Por ejemplo:
    console.log(payload.message);
    this.server.to(payload.tradeId).emit(`buyerConfirmed_${payload.tradeId}`, {
      message: payload.message,
      messageLocalStorage: payload.messageLocalStorage,
    });
  }

  @SubscribeMessage('buyerConfirmationPay')
  handleBuyerConfirmationPay(client: Socket, payload: any) {
    // Lógica al recibir el evento 'compradorConfirmado'
    // Puedes emitir eventos de confirmación o realizar otras acciones
    this.server.emit('buyerConfirmationPay');
  }

  @SubscribeMessage('sellerConfirmationPay')
  handleSellerConfirmationPay(client: Socket, payload: any) {
    // Lógica al recibir el evento 'vendedorConfirmado'
    // Puedes emitir eventos de confirmación o realizar otras acciones
    this.server.emit('sellerConfirmationPay');
  }

  @SubscribeMessage('buyerConfirmationReceived')
  handleBuyerConfirmationReceived(client: Socket, payload: any) {
    console.log('ha llegado la confirmacion del buyer');
    // Lógica al recibir el evento 'compradorConfirmado'
    // Puedes emitir eventos de confirmación o realizar otras acciones
    this.server.emit('buyerConfirmationReceived');
  }

  @SubscribeMessage('sellerConfirmationReceived')
  handleSellerConfirmationReceived(client: Socket, payload: any) {
    // Lógica al recibir el evento 'vendedorConfirmado'
    // Puedes emitir eventos de confirmación o realizar otras acciones
    this.server.emit('sellerConfirmationReceived');
  }

  // !Abajo de aqui nada vale..
  // FUNCION PERSONALIZADA ( EN EL CLIENTE PARA COMUNICARLA DEBE TENER EL MISMO NOMBRE)
  @SubscribeMessage('mensajeCliente')
  handleMessdage(client: Socket, payload: any) {
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
