/* eslint-disable prettier/prettier */
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Users, UsersDocument } from './schema/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { imagesDto } from './dto/imagesDto';
import { UpdateUserDto } from './dto/UpdateBasicUserDto';
import { UpdateRequestDto } from './dto/updateRequestDto.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<UsersDocument>,
  ) {}

  //! return all users
  findAll() {
    const users = this.usersModel.find();
    return users;
  }
  //! return user by id
  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      // Search user in BD
      const user = await this.usersModel.findById(id);
      if (!user) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
      }
      return user;
    } catch (error) {
      // Error
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
  }

  //! find posts by Userid
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

  //! upload image profile
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

  //! update user
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersModel.findById(id);
    if (!user) {
      // Manejar el caso de usuario no encontrado
      throw new NotFoundException('Users_Not_Found');
    }

    user.name = updateUserDto.name;
    user.lastName = updateUserDto.lastName;
    user.username = updateUserDto.username;
    user.gender = updateUserDto.gender;
    await user.save();

    return user;
  }

  // ?push request to user
  async pushRequest(id: string, updateRequestDto: UpdateRequestDto) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

      try {
        // Search user in BD
        const user = await this.usersModel.findById(id);
        if (!user) {
          throw new HttpException('ID_NOT_FOUND_OBJECT', 404);
        }
    
  
        user.requests.push(updateRequestDto);
        await user.save();
        return { sucess: true, message: 'Request added' };
      } catch (error) {
        // Error
        throw new HttpException('SERVER_ERROR', 500);
      }
  }

  // ?get request from user
  async getRequests(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);
    try {
      const user = await this.usersModel.findById(id);
      if (!user) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 404);
      }
      return { success: true, requests: user.requests, user: user.name };
    } catch (error) {
      // Error
      throw new HttpException('SERVER_ERROR', 500);
    }
  }

  //?delete request from user
  async deleteRequest(id: string, requestId: string) {
    const user = await this.usersModel.findById(id);
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    const requestIndex = user.requests.findIndex(
      (request) => request._id.toString() === requestId,
    );

    if (requestIndex === -1) {
      throw new HttpException('REQUEST_NOT_FOUND', 404);
    }

    user.requests.splice(requestIndex, 1);
    await user.save();
    return { success: true, message: 'Request deleted' };
  }

  //? para aceptar solicitud y convertirla en un trade
  async acceptRequest(userId: string, requestId: string) {
    if (!mongoose.isValidObjectId(userId))
      throw new HttpException('USERID_NO_VALID', 404);

    if (!mongoose.isValidObjectId(requestId))
      throw new HttpException('REQUESTID_NO_VALID', 404);

    // !Verificar al seller
    const seller = await this.usersModel.findById(userId);
    if (!seller) {
      throw new HttpException('SELLER_NOT_FOUND', 404);
    }

    // Obtener la solicitud específica del usuario
    const request = seller.requests.find((r) => r._id.toString() === requestId);
    if (!request) {
      throw new HttpException('REQUEST_NOT_FOUND', 404);
    }
    // !Verificar al buyer
    const buyer = await this.usersModel.findById(request.buyerID);
    if (!buyer) {
      throw new HttpException('BUYER_NOT_FOUND', 404);
    }
    //! Crear una nueva fecha y hora actual
    const currentDateTime = new Date();
    //! Actualizar el campo createdAt en la solicitud
    request.createdAt = currentDateTime;

    seller.requests = seller.requests.filter(
      (r) => r._id.toString() !== requestId,
    );
    seller.trades.push(request);
    buyer.trades.push(request);

 
    await seller.save();
    await buyer.save();

    return { success: 'La request ha sido aceptada con exito' };
  }

  //! get trade details
  async getTradeDetails(userId: string, tradeId: string) {
    const user = await this.usersModel.findById(userId);
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    const trade = user.trades.find((trade) => trade._id.toString() === tradeId);

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    return trade;
  }
  //! get trades from user
  async getTrades(userId: string) {
    const user = await this.usersModel.findById(userId);
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    return user.trades;
  }
  
}

/*

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
*/
