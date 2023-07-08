/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from './schema/posts.schema';
import { UsersModule } from 'src/users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Posts.name,
        schema: PostsSchema,
      },
    ]),
    UsersModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'posts', 'images'),
      //rootPath: join(__dirname, 'imagesProfile'),
      //Esta en ruta absoulta. Por ende en el servidor no funcionara este endPoint de fotos de perfil estaticas.
      //rootPath: join(__dirname, 'imagesProfile') (Este codigo toma el __dirname desde la carpeta dist.)
      serveRoot: '/images/posts',
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService, MongooseModule],
})
export class PostsModule {}
