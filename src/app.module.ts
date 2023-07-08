/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { WebSocketModule } from './websockets/websockets.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [],
      useFactory: () => ({
        uri: process.env.DB_URI,
      }),
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    ImagesModule,
    WebSocketModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'alejandroaml0528@gmail.com',
          pass: 'sxglpwqcznnxnuyg',
        },
      },
    }),
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
