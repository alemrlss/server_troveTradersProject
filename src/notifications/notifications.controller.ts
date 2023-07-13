import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './schema/notification.schema';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  createNotification(@Body() notificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(notificationDto);
  }

  @Get(':id')
  getNotificationsByUserId(@Param('id') id: string) {
    return this.notificationsService.getNotificationsByUserId(id);
  }
}
