/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostsService } from 'src/posts/posts.service';
import { Users } from './schema/users.schema';
import { UpdateImageProfileDto } from './dto/update-imageProfile';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, renameImage } from 'src/users/helpers/users.helpers';
import * as fs from 'fs';
import { join } from 'path';

@ApiTags('Users')
@Controller('users')
//@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // return all users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // return user by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //return posts by id(retorna los posts de el id pasado en cuestion)
  @Get(':id/posts')
  findPostById(@Param('id') id: string) {
    return this.usersService.findPostById(id);
  }

  @Post(':id/imageProfile')
  @UseInterceptors(
    FileInterceptor('imageProfile', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const destinationFolder = join(__dirname, 'imagesProfile');
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
    return await this.usersService.uploadProfileImage(id, file);
  }

  /* 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  */
}
