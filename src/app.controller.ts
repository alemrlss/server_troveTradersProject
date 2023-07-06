/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ------ TESTING EMAIL SENDS--------
  //@Get('/email')
  //sendMail(): void {
  // return this.appService.sendMail();
  //}
}
