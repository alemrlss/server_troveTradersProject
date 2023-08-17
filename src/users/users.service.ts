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

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      // Search user in BD
      const user = await this.usersModel.findByIdAndDelete(id);
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
    request.agreementConfirmationSeller = false;
    request.agreementConfirmationBuyer = false;
    request.payConfirmationBuyer = false;
    request.payConfirmationSeller = false;
    request.receivedConfirmationBuyer = false;
    request.receivedConfirmationSeller = false;

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

  async moveTradeToFinish(tradeId: string, userId: string) {
    const user = await this.usersModel.findById(userId);

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    const tradeIndex = user.trades.findIndex(
      (t) => t._id.toString() === tradeId,
    );

    if (tradeIndex === -1) {
      throw new Error('No se encontró el trade en el usuario');
    }

    // Obtén el trade que se va a mover
    const tradeToMove = user.trades.splice(tradeIndex, 1)[0];

    // Agrega el trade a la lista de tradesFinished
    user.tradesFinished.push(tradeToMove);

    await user.save();

    return { success: true, message: 'Trade moved to finished' };
  }

  async confirmAgreementSeller(
    idTrade: string,
    idSeller: string,
    idBuyer: string,
  ) {
    const buyer = await this.usersModel.findById(idBuyer);
    if (!buyer) {
      throw new Error('Usuario comprador no encontrado');
    }
    const seller = await this.usersModel.findById(idSeller);
    if (!seller) {
      throw new Error('Usuario comprador no encontrado');
    }

    // Buscar el trade dentro del usuario comprador por su ID
    const tradeSeller = seller.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeSeller) {
      throw new Error('Trade del Vendedor no encontrado');
    }
    const tradeBuyer = buyer.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeBuyer) {
      throw new Error('Trade del Comprador no encontrado');
    }

    tradeBuyer.agreementConfirmationSeller = true;
    tradeSeller.agreementConfirmationSeller = true;

    await seller.save();
    await buyer.save();
    return { success: true, message: 'Trade agreement confirmed by Seller' };
  }
  async confirmAgreementBuyer(
    idTrade: string,
    idSeller: string,
    idBuyer: string,
  ) {
    const buyer = await this.usersModel.findById(idBuyer);
    if (!buyer) {
      throw new Error('Usuario comprador no encontrado');
    }
    const seller = await this.usersModel.findById(idSeller);
    if (!seller) {
      throw new Error('Usuario comprador no encontrado');
    }

    // Buscar el trade dentro del usuario comprador por su ID
    const tradeSeller = seller.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeSeller) {
      throw new Error('Trade del Vendedor no encontrado');
    }
    const tradeBuyer = buyer.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeBuyer) {
      throw new Error('Trade del Comprador no encontrado');
    }

    tradeBuyer.agreementConfirmationBuyer = true;
    tradeSeller.agreementConfirmationBuyer = true;

    await seller.save();
    await buyer.save();

    return { success: true, message: 'Trade agreement confirmed by Buyer' };
  }

  async confirmPayBuyer(idTrade: string, idSeller: string, idBuyer: string) {
    const buyer = await this.usersModel.findById(idBuyer);
    if (!buyer) {
      throw new Error('Usuario comprador no encontrado');
    }
    const seller = await this.usersModel.findById(idSeller);
    if (!seller) {
      throw new Error('Usuario comprador no encontrado');
    }

    // Buscar el trade dentro del usuario comprador por su ID
    const tradeSeller = seller.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeSeller) {
      throw new Error('Trade del Vendedor no encontrado');
    }
    const tradeBuyer = buyer.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeBuyer) {
      throw new Error('Trade del Comprador no encontrado');
    }

    tradeBuyer.payConfirmationBuyer = true;
    tradeSeller.payConfirmationBuyer = true;

    await seller.save();
    await buyer.save();

    return { success: true, message: 'Trade pay confirmed by Buyer' };
  }

  async confirmPaySeller(idTrade: string, idSeller: string, idBuyer: string) {
    const buyer = await this.usersModel.findById(idBuyer);
    if (!buyer) {
      throw new Error('Usuario comprador no encontrado');
    }
    const seller = await this.usersModel.findById(idSeller);
    if (!seller) {
      throw new Error('Usuario comprador no encontrado');
    }
    // Buscar el trade dentro del usuario comprador por su ID
    const tradeSeller = seller.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeSeller) {
      throw new Error('Trade del Vendedor no encontrado');
    }
    const tradeBuyer = buyer.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeBuyer) {
      throw new Error('Trade del Comprador no encontrado');
    }

    tradeBuyer.payConfirmationSeller = true;
    tradeSeller.payConfirmationSeller = true;

    await seller.save();
    await buyer.save();

    return { success: true, message: 'Trade pay confirmed by Seller' };
  }

  async confirmReceivedBuyer(
    idTrade: string,
    idSeller: string,
    idBuyer: string,
  ) {
    const buyer = await this.usersModel.findById(idBuyer);
    if (!buyer) {
      throw new Error('Usuario comprador no encontrado');
    }
    const seller = await this.usersModel.findById(idSeller);
    if (!seller) {
      throw new Error('Usuario comprador no encontrado');
    }
    // Buscar el trade dentro del usuario comprador por su ID
    const tradeSeller = seller.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeSeller) {
      throw new Error('Trade del Vendedor no encontrado');
    }
    const tradeBuyer = buyer.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeBuyer) {
      throw new Error('Trade del Comprador no encontrado');
    }

    tradeBuyer.receivedConfirmationBuyer = true;
    tradeSeller.receivedConfirmationBuyer = true;

    await seller.save();
    await buyer.save();

    return { success: true, message: 'Trade Received confirmed by Buyer' };
  }
  async confirmReceivedSeller(
    idTrade: string,
    idSeller: string,
    idBuyer: string,
  ) {
    const buyer = await this.usersModel.findById(idBuyer);
    if (!buyer) {
      throw new Error('Usuario comprador no encontrado');
    }
    const seller = await this.usersModel.findById(idSeller);
    if (!seller) {
      throw new Error('Usuario comprador no encontrado');
    }
    // Buscar el trade dentro del usuario comprador por su ID
    const tradeSeller = seller.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeSeller) {
      throw new Error('Trade del Vendedor no encontrado');
    }
    const tradeBuyer = buyer.trades.find((t) => t._id.toString() === idTrade);
    if (!tradeBuyer) {
      throw new Error('Trade del Comprador no encontrado');
    }

    tradeBuyer.receivedConfirmationSeller = true;
    tradeSeller.receivedConfirmationSeller = true;

    await seller.save();
    await buyer.save();

    return { success: true, message: 'Trade Received confirmed by Seller' };
  }

  async uploadVerify(id: string, file: imagesDto, simulator: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_VALID', 404);
    if (simulator !== 'true') {
      return {
        success: false,
        message: 'Document uploaded with verification false',
      };
    }
    const user = await this.usersModel.findById(id);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    user.imageDocument = file.filename;
    user.isVerify = true;
    const updatedUser = await user.save();
    return {
      success: true,
      message: 'Document uploaded with verification',
      updatedUser,
    };
  }

  /* 
      DASHBOARD END POINTS
  */

  async blockUser(email: string) {
    try {
      // Search user in BD
      const user = await this.usersModel.findOne({ email }).exec();

      if (!user) {
        throw new HttpException('USER_NOT_FOUND', 404);
      }

      if (user.blocked === true) {
        throw new HttpException('ALREADY_HAS_BLOCKED', 403);
      }

      user.blocked = true;
      await user.save();
      return user;
    } catch (error) {
      // Error
      return error;
    }
  }

  async desblockUser(email: string) {
    try {
      // Search user in BD
      const user = await this.usersModel.findOne({ email }).exec();

      if (!user) {
        throw new HttpException('USER_NOT_FOUND', 404);
      }

      user.blocked = false;
      await user.save();
      return user;
    } catch (error) {
      // Error
      return error;
    }
  }

  async blockedUsers() {
    const users = await this.usersModel.find({ blocked: true }).exec();
    return users;
  }

  async dashboardInfo() {
    try {
      const users = await this.usersModel.find();
      const finishedTradesCount =
        users.reduce((total, user) => total + user.tradesFinished.length, 0) /
        2;
      const ongoingTradesCount =
        users.reduce((total, user) => total + user.trades.length, 0) / 2;

      const registeredUsersCount = await this.usersModel.countDocuments();
      const verifiedUsersCount = await this.usersModel.countDocuments({
        isVerify: true,
      });

      return {
        registered: registeredUsersCount,
        verified: verifiedUsersCount,
        finishedTradesCount: finishedTradesCount,
        runningTrades: ongoingTradesCount,
      };
    } catch (error) {
      throw new Error('Error getting users counts');
    }
  }
}

/*

  remove(id: number) {+
    return `This action removes a #${id} user`;
  }
*/
