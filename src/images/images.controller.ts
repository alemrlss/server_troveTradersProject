import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, renameImage } from './helpers/images.helper';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}
  //@Post('upload')
  //@UseInterceptors(FileInterceptor('file'))
  //uploadFile(@UploadedFile() file: Express.Multer.File) {
  //  console.log(file);
  //}
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        //destination: './upload',
        filename: renameImage,
      }),
      fileFilter: fileFilter,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
