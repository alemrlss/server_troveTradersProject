import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  // ------ TESTING EMAIL SENDS--------
  //sendMail(): void {
  // this.mailerService.sendMail({
  //to: 'ale89plays@gmail.com', //a donde va el correo
  //from: 'Hola vaca loca', //no se para que sirve
  //subject: 'Mensaje importante para de tu novio Alejandro Morales', //Texto que va cuando llega el msj
  //html: '<h2> Hola mi amor te amo mucho!! </h2><b>Te adoro</b>', //cuerpo del mensaje
  //});
  //}
}
