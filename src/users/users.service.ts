import { HttpException, Injectable } from '@nestjs/common';
import { Users, UsersDocument } from './schema/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModule: Model<UsersDocument>,
  ) {}

  findAll() {
    const users = this.usersModule.find();
    return users;
  }
  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      // Search user in BD
      const user = await this.usersModule.findById(id);
      if (!user) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 404);
      }
      return user;
    } catch (error) {
      // Error
      throw new HttpException('SERVER_ERROR', 500);
    }
  }

  async findPostById(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);
    try {
      // Search user in BD
      const user = await this.usersModule.findById(id).populate('posts').exec();
      if (!user) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 404);
      }
      return user.posts;
    } catch (error) {
      // Error
      throw new HttpException('SERVER_ERROR', 500);
    }
  }

  /*

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
*/
}
