import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admins, AdminsSchema } from './schema/admins.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Admins.name,
        schema: AdminsSchema,
      },
    ]),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService, MongooseModule],
})
export class AdminsModule {}
