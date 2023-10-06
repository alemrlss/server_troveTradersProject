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
  Delete,
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

  //!get all posts
  @Get()
  @ApiOperation({ summary: 'Get all Posts' })
  findAll() {
    return this.postsService.findAll();
  }

  //!get posts availables
  @Get('availables')
  @ApiOperation({ summary: 'Obtener todos los posts disponibles' })
  async getAllAvailablePosts() {
    return this.postsService.getAllAvailablePosts();
  }
  //!get post by id
  @Get(':id')
  @ApiOperation({ summary: 'Get Post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(id);
  }
  //! get posts by userid
  @Get('/user-posts/:id')
  @ApiOperation({ summary: 'Obtener los posts de un usuario específico' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async getPostsbyUserId(@Param('id') id: string) {
    return await this.postsService.getPostsbyUserId(id);
  }

  //!create post with photos
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
  @ApiOperation({
    summary:
      'change state post( DISPONIBLE, ACUERDO, PAGO, RECIBO Y FINALIZADO )',
  })
  async updatePostState(
    @Param('postId') postId: string,
    @Body() updateStateDto: UpdateStateDto, // DTO con la información del estado a actualizar
  ) {
    return this.postsService.updateStatePost(postId, updateStateDto);
  }

  //!Hasta los momentos se edita todo, y con las imagenes se añaden
  @Put('/edit/:id')
  @ApiOperation({
    summary: 'Edit Post',
  })
  @UseInterceptors(
    FilesInterceptor('newPhoto', null, {
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
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files && files.length > 0) {
      // Obtener los nombres de los archivos de las nuevas imágenes
      const newPhotoPaths = files.map((file) => file.filename);
      updatePostDto.newPhotos = newPhotoPaths;
    }
    return await this.postsService.updatePost(id, updatePostDto);
  }

  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Delete post and images post',
  })
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Get('categories/count')
  async getPostCountByCategory() {
    const postCounts = await this.postsService.getPostCountByCategory();
    return postCounts;
  }
  /*

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

 
  */
}
