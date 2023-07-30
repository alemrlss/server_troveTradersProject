import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create notification' })
  createNotification(@Body() notificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(notificationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by id' })
  getNotificationsByUserId(@Param('id') id: string) {
    return this.notificationsService.getNotificationsByUserId(id);
  }

  @Put('/:userId/read/:id')
  @ApiOperation({ summary: 'Read notification' })
  readNotification(
    @Param('id') idRequest: string,
    @Param('userId') userId: string,
  ) {
    return this.notificationsService.readNotification(idRequest, userId);
  }
}
