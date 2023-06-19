import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Users, UsersDocument } from './schema/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { imagesDto } from './dto/imagesDto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<UsersDocument>,
  ) {}

  findAll() {
    const users = this.usersModel.find();
    return users;
  }
  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      // Search user in BD
      const user = await this.usersModel.findById(id);
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
      const user = await this.usersModel.findById(id).populate('posts').exec();
      if (!user) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 404);
      }
      return user.posts;
    } catch (error) {
      // Error
      throw new HttpException('SERVER_ERROR', 500);
    }
  }

  async uploadProfileImage(id: string, file: imagesDto) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_VALID', 404);

    const user = await this.usersModel.findById(id);

    if (!user) {
      // Manejar el caso si no se encuentra al usuario
      throw new NotFoundException('User_not_found');
    }

    user.imageProfile = file.filename;
    const updatedUser = await user.save();

    return updatedUser;
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
