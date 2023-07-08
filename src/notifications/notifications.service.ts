import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schema/notification.schema';
import { Users } from 'src/users/schema/users.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,

    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
  ) {}
  async createNotification(createNotificationDto: CreateNotificationDto) {
    const { sellerId, message } = createNotificationDto;

    const newNotification = new this.notificationModel({
      sellerId,
      message,
    });
    const notification = await newNotification.save();

    const seller = await this.usersModel.findById(sellerId);
    if (seller) {
      seller.notifications.push(notification);
      await seller.save();
    }
    return notification;
  }
}
