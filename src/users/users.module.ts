/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './schema/users.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DisputesModule } from 'src/disputes/disputes.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UsersSchema,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'users', 'imagesProfile'),
      serveRoot: '/image/profile',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'users', 'documents'),
      serveRoot: '/image/documents',
    }),
    DisputesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
