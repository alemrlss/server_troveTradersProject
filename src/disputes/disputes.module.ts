import { Module } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Disputes, DisputesSchema } from './schema/disputes.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Disputes.name,
        schema: DisputesSchema,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'disputes', 'proofs'),
      serveRoot: '/images/proofs',
    }),
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
