import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from './schema/posts.schema';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Posts.name,
        schema: PostsSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService, MongooseModule],
})
export class PostsModule {}
