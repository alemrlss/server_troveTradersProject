/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
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

@ApiTags('Users')
@Controller('users')
//@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // return all users
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  // return user by id
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //return posts by id(retorna los posts de el id pasado en cuestion)
  @Get(':id/posts')
  @ApiOperation({ summary: 'Get posts by userID.' })
  @ApiParam({ name: 'id', description: 'user id' })
  findPostById(@Param('id') id: string) {
    return this.usersService.findPostById(id);
  }

  //update profile image
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
          // const destinationFolder = join(__dirname, 'imagesProfile');
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

  //update general info users(name, lastname, gender, username)
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

  /* 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  */
}
