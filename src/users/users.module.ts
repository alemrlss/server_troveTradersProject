/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './schema/users.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
      //rootPath: join(__dirname, 'imagesProfile'),
      //Esta en ruta absoulta. Por ende en el servidor no funcionara este endPoint de fotos de perfil estaticas.
      //rootPath: join(__dirname, 'imagesProfile') (Este codigo toma el __dirname desde la carpeta dist.)
      serveRoot: '/image/profile',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {
}
