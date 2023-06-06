import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsDocument } from './schema/posts.schema';
import { Model } from 'mongoose';
import { Users } from 'src/users/schema/users.schema';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) private postsModel: Model<PostsDocument>,
    @InjectModel(Users.name) private usersModel: Model<PostsDocument>,
  ) {}

  //create posts and push in the userModel
  async create(PostObject: CreatePostDto) {
    const { author_id } = PostObject;
    console.log(PostObject);
    const post = await this.postsModel.create(PostObject);

    await this.usersModel.findByIdAndUpdate(author_id, {
      $push: { posts: post._id },
    });

    return post;
  }

  //return allPosts
  async findAll() {
    const allPosts = await this.postsModel.find();
    return allPosts;
  }

  //return one post by id
  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
