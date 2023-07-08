/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

import { ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, renameImage } from 'src/helpers/images.helpers';
import { join } from 'path';
import * as fs from 'fs';
import { UpdateStateDto } from './dto/update-state.dto';

@ApiTags('Posts')
@Controller('posts')
//@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //get all posts
  @Get()
  @ApiOperation({ summary: 'Get all Posts' })
  findAll() {
    return this.postsService.findAll();
  }
  //get post by id
  @Get(':id')
  @ApiOperation({ summary: 'Get Post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(id);
  }

  //create post with photos
  @Post()
  @ApiOperation({
    summary:
      'Create post(Sin imagenes ya que swagger no puede leerlas. Las imagenes van en el campo file)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', null, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const destinationFolder = join(
            process.cwd(),
            'src',
            'posts',
            'images',
          );
          fs.mkdirSync(destinationFolder, { recursive: true });
          cb(null, destinationFolder);
        },
        filename: renameImage,
      }),
      fileFilter: fileFilter,
    }),
  )
  createPost(
    @Body() PostObject: CreatePostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(PostObject);
    return this.postsService.createPost(PostObject, files);
  }

  //update currentState post( DISPONIBLE, ACUERDO, PAGO, RECIBO Y FINALIZADO )
  @Put('/:postId')
  async updatePostState(
    @Param('postId') postId: string,
    @Body() updateStateDto: UpdateStateDto, // DTO con la información del estado a actualizar
  ) {
    return this.postsService.updateStatePost(postId, updateStateDto);
  }

  //update post by id
  //pendiente por terminar...
  //@Put(':id')
  //async updatePost(
  // @Param('id') id: string,
  //@Body() updatePostDto: UpdatePostDto,
  //) {
  // return await this.postsService.updatePost(id, updatePostDto);
  //}

  /*

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
  */
}
