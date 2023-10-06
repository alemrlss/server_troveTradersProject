/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Categories,
  PostState,
  Posts,
  PostsDocument,
} from './schema/posts.schema';
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

  async getPostsbyUserId(id: string) {
    return await this.postsModel.find({
      author_id: id,
      currentState: 'disponible',
    });
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

    // Validate the category
    if (!Object.values(Categories).includes(PostObject.category)) {
      throw new HttpException('CATEGORIA_NO_VALIDA', 403);
    }
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

  //return only posts available
  async getAllAvailablePosts() {
    const posts = await this.postsModel.find({ currentState: 'disponible' });
    const postsReversed = posts.reverse();

    return postsReversed;
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
  async updatePost(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postsModel.findById(id);
    if (!post) {
      throw new HttpException('POST_NOT_FOUND', 404);
    }

    post.title = updatePostDto.title;
    post.description = updatePostDto.description;
    post.price = updatePostDto.price;

    if (updatePostDto.newPhotos) {
      // Si hay nuevas imágenes, las añadimos al post
      post.photos.push(...updatePostDto.newPhotos);
    }
    await post.save();
    return post;
  }

  //delete post by id
  async remove(id: string) {
    const post = await this.postsModel.findByIdAndDelete(id);
    if (!post) {
      throw new HttpException('POST_NOT_FOUND', 404);
    }

    // Obtén el ID del autor del post
    const authorId = post.author_id;

    // Elimina el post del arreglo de posts del usuario
    await this.usersModel.findByIdAndUpdate(authorId, {
      $pull: { posts: post._id },
    });
    return post;
  }

  async getPostCountByCategory() {
    const pipeline = [
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ];

    const result = await this.postsModel.aggregate(pipeline).exec();

    const postCounts = result.map((entry) => ({
      name: entry._id,
      value: entry.count,
    }));

    return postCounts;
  }
}
