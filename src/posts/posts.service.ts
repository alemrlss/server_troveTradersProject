import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostState, Posts, PostsDocument } from './schema/posts.schema';
import mongoose, { Model } from 'mongoose';
import { Users } from 'src/users/schema/users.schema';
import { UpdatePostDto } from './dto/update-post.dto';
import { join } from 'path';
import * as fs from 'fs';
import { UpdateStateDto } from './dto/update-state.dto';
import { canUpdateState } from './helpers/canUpdateState.helpers';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) private postsModel: Model<PostsDocument>,
    @InjectModel(Users.name) private usersModel: Model<PostsDocument>,
  ) {}

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('POST_NOT_FOUND', 404);

    try {
      // Search post in BD
      const post = await this.postsModel.findById(id);
      if (!post) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
      }
      return post;
    } catch (error) {
      console.log(error);
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
  }

  //create posts and push in the userModel
  async create(PostObject: CreatePostDto) {
    const { author_id } = PostObject;

    if (!mongoose.isValidObjectId(author_id))
      throw new HttpException('ID_NO_VALID', 404);
    console.log(PostObject);
    const post = await this.postsModel.create(PostObject);

    await this.usersModel.findByIdAndUpdate(author_id, {
      $push: { posts: post._id },
    });

    return post;
  }

  async createPost(
    PostObject: CreatePostDto,
    files: Array<Express.Multer.File>,
  ) {
    const { author_id } = PostObject;

    if (!mongoose.isValidObjectId(author_id))
      throw new HttpException('ID_NO_VALID', 404);
    console.log(PostObject);
    console.log(files);

    const photoPaths = [];
    for (const file of files) {
      //const destinationFolder = join(process.cwd(), 'src', 'posts', 'images');
      // const filePath = join(destinationFolder, file.filename);
      // Move the file to the destination folder
      //fs.renameSync(file.path, filePath);
      // Add the file path to the array
      photoPaths.push(file.filename);
    }
    // Add the photoPaths array to the PostObject
    PostObject.photos = photoPaths;
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
  //update state POST
  async updateStatePost(postId: string, updatePostDto: UpdateStateDto) {
    const post = await this.postsModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (!canUpdateState(post.currentState, updatePostDto.newState)) {
      throw new BadRequestException('Invalid state update');
    }
    // Realiza la actualización del estado del post
    post.currentState = updatePostDto.newState as PostState;
    await post.save();

    return { newState: updatePostDto.newState, post };
  }

  //update post by id
  async updatePost(id: string, updateUserDto: UpdatePostDto) {
    const user = await this.usersModel.findById(id);
    if (!user) {
      // Manejar el caso de usuario no encontrado
      throw new NotFoundException('User_Not_Found');
    }

    return updateUserDto;
  }
}
