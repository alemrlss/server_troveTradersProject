import { HttpException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
    const { sellerId, message, target } = createNotificationDto;

    const newNotification = new this.notificationModel({
      sellerId,
      message,
      target,
    });
    const notification = await newNotification.save();

    const seller = await this.usersModel.findById(sellerId);
    if (seller) {
      seller.notifications.push(notification);
      await seller.save();
    }
    return notification;
  }

  async getNotificationsByUserId(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpException('ID_NOT_FOUND', 404);
    }

    const user = await this.usersModel.findById(id);

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 403);
    }

    return user.notifications;
  }

  async readNotification(idRequest: string, userId: string) {
    if (!mongoose.isValidObjectId(idRequest)) {
      throw new HttpException('ID_REQUEST_NOT_FOUND', 404);
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new HttpException('ID_USER_NOT_FOUND', 404);
    }
    const user = await this.usersModel.findById(userId);
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }
    const newNotification = await this.notificationModel.findByIdAndUpdate(
      idRequest,
      { read: true },
      { new: true },
    );
    if (!newNotification) {
      throw new HttpException('NOTIFCATION_NOT_FOUND', 404);
    }
    const notification = user.notifications.find(
      (notification) => notification._id.toString() === idRequest,
    );
    if (!notification) {
      throw new HttpException('NOTIFICATION_NOT_FOUND', 404);
    }

    notification.read = true;
    await user.save();

    return { message: 'READ_NOTIFICATION_SUCCESSFULLY' };
  }
}
