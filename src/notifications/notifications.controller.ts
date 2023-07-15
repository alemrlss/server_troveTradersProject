import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

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

  @Put('/:userId/read/:id')
  readNotification(
    @Param('id') idRequest: string,
    @Param('userId') userId: string,
  ) {
    return this.notificationsService.readNotification(idRequest, userId);
  }
}
