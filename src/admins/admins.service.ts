import { HttpException, Injectable } from '@nestjs/common';

import { Admins, AdminsDocument } from './schema/admins.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admins.name) private adminsModel: Model<AdminsDocument>,
  ) {}
  findAll() {
    const admins = this.adminsModel.find();
    return admins;
  }
  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      // Search user in BD
      const admin = await this.adminsModel.findById(id);
      if (!admin) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
      }
      return admin;
    } catch (error) {
      // Error
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
  }
  async remove(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      // Search user in BD
      const admin = await this.adminsModel.findByIdAndDelete(id);
      if (!admin) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
      }
      return admin;
    } catch (error) {
      // Error
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
  }

  /*
  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  */
}
