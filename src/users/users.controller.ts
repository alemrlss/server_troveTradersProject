/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostsService } from 'src/posts/posts.service';
import { Users } from './schema/users.schema';
import { diskStorage } from 'multer';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { fileFilter, renameImage } from 'src/helpers/images.helpers';
import * as fs from 'fs';
import { join } from 'path';
import { UpdateUserDto } from 'src/users/dto/UpdateBasicUserDto';
import { UpdateRequestDto } from './dto/updateRequestDto.dto';
import { rateUserDto } from './dto/rateUserDto';

@ApiTags('Users')
@Controller('users')
//@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // !return all users
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  // !return user by id
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // !return posts by id(retorna los posts de el id pasado en cuestion)
  @Get(':id/posts')
  @ApiOperation({ summary: 'Get posts by userID.' })
  @ApiParam({ name: 'id', description: 'user id' })
  findPostById(@Param('id') id: string) {
    return this.usersService.findPostById(id);
  }

  // !update profile image
  @Post(':id/imageProfile')
  @ApiOperation({
    summary:
      'Post profile image(No funciona en swagger ya que no tiene interfaz para cargar archivos)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProperty({
    type: 'file',
    format: 'binary',
    example: 'https://example.com/sample-image.jpg',
  })
  @UseInterceptors(
    FileInterceptor('imageProfile', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // const destinationFolder = join(__dirname, 'imagesPrfoile');
          const destinationFolder = join(
            process.cwd(),
            'src',
            'users',
            'imagesProfile',
          );
          fs.mkdirSync(destinationFolder, { recursive: true });
          cb(null, destinationFolder);
        },
        filename: renameImage,
      }),
      fileFilter: fileFilter,
    }),
  )
  async updateImageProfile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('NOT_IMAGE_FOUND', 404);
    }
    return await this.usersService.uploadProfileImage(id, file);
  }

  //!update general info users(name, lastname, gender, username)
  @Put(':id')
  @ApiOperation({
    summary: 'Put basic info user by ID(Name-Lastname-Username-Gender)  ',
  })
  @ApiParam({ name: 'id', description: 'User id' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  //?pushes requests to user
  @Post(':id/requests')
  @ApiOperation({ summary: 'Post request to user' })
  @ApiParam({ name: 'id', description: 'User id' })
  async pushRequest(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return await this.usersService.pushRequest(id, updateRequestDto);
  }

  //?get requests from user
  @Get(':id/requests')
  @ApiOperation({ summary: 'Get requests from user' })
  @ApiParam({ name: 'id', description: 'User id' })
  async getRequests(@Param('id') id: string) {
    return await this.usersService.getRequests(id);
  }

  //?delete request from user
  @Delete(':userId/requests/:requestId')
  async deleteRequest(
    @Param('userId') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return await this.usersService.deleteRequest(userId, requestId);
  }

  //? endpoint para aceptar solicitud y convertirla en un trade
  @Post(':userId/requests/:requestId/accept')
  async acceptRequest(
    @Param('userId') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return await this.usersService.acceptRequest(userId, requestId);
  }

  // !getTradeDetails
  @Get(':userId/trades/:tradeId')
  getTradeDetails(
    @Param('userId') userId: string,
    @Param('tradeId') tradeId: string,
  ) {
    return this.usersService.getTradeDetails(userId, tradeId);
  }

  //!get all trades from user
  @Get(':userId/trades')
  getTrades(@Param('userId') userId: string) {
    return this.usersService.getTrades(userId);
  }

  @Put('trades/:tradeId/:userId')
  moveTradeToFinish(
    @Param('tradeId') tradeId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.moveTradeToFinish(tradeId, userId);
  }

  //! PETICION PARA ENTRAR EN DISPUTA!! INDISPUTE=TRUE!! PARA EL PAGO
  @Post('trades/:idTrade/:idSeller/:idBuyer/dispute/pay')
  disputeTradePay(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.inDisputeTradePay(idTrade, idSeller, idBuyer);
  }
  //! PETICION PARA ENTRAR EN DISPUTA!! INDISPUTE=TRUE!! PARA EL RECIBO.
  @Post('trades/:idTrade/:idSeller/:idBuyer/dispute/received')
  disputeTradeReceived(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.inDisputeTradeReceived(idTrade, idSeller, idBuyer);
  }
  //!! PETICION PARA SALIR DE UNA DISPUTA(CONTIUNUAR TRADE) INDISPUTE=FALSE!!
  @Post('trades/:idTrade/:idSeller/:idBuyer/continue')
  continueTrade(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.continueTrade(idTrade, idSeller, idBuyer);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/cancel/:whoCanceled')
  confirmCancelTrade(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
    @Param('whoCanceled') whoCanceled: string,
  ) {
    return this.usersService.confirmCancelTrade(
      idTrade,
      idSeller,
      idBuyer,
      whoCanceled,
    );
  }
  @Post('trades/:idTrade/:idSeller/:idBuyer/cancel')
  confirmCancelTradeAdmin(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.confirmCancelTradeAdmin(
      idTrade,
      idSeller,
      idBuyer,
    );
  }

  @Post('trades/:idTrade/:idUser/cancel/')
  cancelTradeBuyer(
    @Param('idTrade') idTrade: string,
    @Param('idUser') idUser: string,
  ) {
    return this.usersService.cancelTradeBuyer(idTrade, idUser);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/deliverDate')
  deliverDate(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
    @Body('days') days: number,
  ) {
    return this.usersService.deliverDate(idTrade, idSeller, idBuyer, days);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/confirmationAgreementSeller')
  confirmAgreementSeller(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.confirmAgreementSeller(idTrade, idSeller, idBuyer);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/confirmationAgreementBuyer')
  confirmAgreementBuyer(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.confirmAgreementBuyer(idTrade, idSeller, idBuyer);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/confirmationPayBuyer')
  confirmPayBuyer(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.confirmPayBuyer(idTrade, idSeller, idBuyer);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/confirmationPaySeller')
  confirmPaySeller(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.confirmPaySeller(idTrade, idSeller, idBuyer);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/confirmationReceivedBuyer')
  confirmReceivedBuyer(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.confirmReceivedBuyer(idTrade, idSeller, idBuyer);
  }

  @Post('trades/:idTrade/:idSeller/:idBuyer/confirmationReceivedSeller')
  confirmReceivedSeller(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
  ) {
    return this.usersService.confirmReceivedSeller(idTrade, idSeller, idBuyer);
  }

  @Post('verify/:id/upload-document/:simulator')
  @ApiOperation({
    summary:
      'Post document image(No funciona en swagger ya que no tiene interfaz para cargar archivos). (el parametro simulator es para simular que el usuario esta subiendo un documento de identidad fue bien verificado o no.)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProperty({
    type: 'file',
    format: 'binary',
    example: 'https://example.com/sample-image.jpg',
  })
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // const destinationFolder = join(__dirname, 'imagesProfile');
          const destinationFolder = join(
            process.cwd(),
            'src',
            'users',
            'documents',
          );
          fs.mkdirSync(destinationFolder, { recursive: true });
          cb(null, destinationFolder);
        },
        filename: renameImage,
      }),
      fileFilter: fileFilter,
    }),
  )
  verifyAccount(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Param('simulator') simulator: string,
  ) {
    if (!file) {
      throw new HttpException('NOT_IMAGE_FOUND', 404);
    }
    return this.usersService.uploadVerify(id, file, simulator);
  }

  @Post('rateUser/:id')
  @ApiOperation({ summary: 'Rate a user by id. Body: newRating and comment.' })
  @ApiParam({ name: 'id', description: 'User id' })
  async rateUser(@Param('id') id: string, @Body() rateUserData: rateUserDto) {
    if (rateUserData.newRating < 0 || rateUserData.newRating > 5) {
      throw new BadRequestException(
        'newRating debe estar en el rango de 0 a 5',
      );
    }
    return await this.usersService.rateUser(id, rateUserData);
  }

  @Post('disputes/:idTrade/:idSeller/:idBuyer')
  handleAlertPay(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,
    @Body('message') message: string,
    @Body('role') role: string,
    @Body('disputeId') disputeId: string,
  ) {
    return this.usersService.handleAlertPay(
      idTrade,
      idSeller,
      idBuyer,
      message,
      role,
      disputeId,
    );
  }

  @Delete('disputes/:idTrade/:idSeller/:idBuyer')
  deleteAlertPay(
    @Param('idTrade') idTrade: string,
    @Param('idSeller') idSeller: string,
    @Param('idBuyer') idBuyer: string,

    @Body('role') role: string,
  ) {
    return this.usersService.deleteAlertPay(idTrade, idSeller, idBuyer, role);
  }
  /* 
      DASHBOARD END POINTS
  */
  @Post('blockByEmail')
  blockUser(@Body() { email }) {
    return this.usersService.blockUser(email);
  }
  @Post('desblockByEmail')
  desblockUser(@Body() { email }) {
    return this.usersService.desblockUser(email);
  }

  @Get('block/users')
  blockedUsers() {
    return this.usersService.blockedUsers();
  }

  @Get('dashboard/info')
  dashboardInfo() {
    return this.usersService.dashboardInfo();
  }
}
