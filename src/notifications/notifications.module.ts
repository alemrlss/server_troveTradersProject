import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema, Notification } from './schema/notification.schema';
import { UsersModule } from 'src/users/users.module';
import { AppGateway } from 'src/websockets/websockets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      // Otros modelos necesarios
    ]),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
