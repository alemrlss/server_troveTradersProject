import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { fileFilter, renameImage } from 'src/helpers/images.helpers';
import * as fs from 'fs';
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  findAll() {
    return this.disputesService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputesService.findOne(id);
  }

  @Post('/:idDispute')
  handleAlertPay(
    @Param('idDispute') idDispute: string,
    @Body('message') message: string,
    @Body('role') role: string,
    @Body('disputeId') disputeId: string,
  ) {
    return this.disputesService.handleAlertPay(
      idDispute,
      message,
      role,
      disputeId,
    );
  }

  @Post(':id/uploadProof/:role')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // const destinationFolder = join(__dirname, 'proofs');
          const destinationFolder = join(
            process.cwd(),
            'src',
            'disputes',
            'proofs',
          );
          fs.mkdirSync(destinationFolder, { recursive: true });
          cb(null, destinationFolder);
        },
        filename: renameImage,
      }),
      fileFilter: fileFilter,
    }),
  )
  async uploadProof(
    @Param('id') id: string, // Parámetro de la ruta para obtener el ID de la disputa
    @Param('role') role: string, // Parámetro de la ruta para obtener el ID de la disputa
    @UploadedFile() file: Express.Multer.File, // Archivo cargado
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Llama a tu servicio para manejar la carga de la prueba
    return await this.disputesService.uploadProof(id, file, role);
  }

  @Delete(':id/deleteProof/:role')
  async deleteProof(@Param('id') id: string, @Param('role') role: string) {
    return this.disputesService.deleteProof(id, role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disputesService.deleteDispute(id);
  }

  @Post(':id/deliverDate')
  deliverDate(@Param('id') id: string, @Body('days') days: number) {
    // en esta peticion se tiene que modificar la disputa y calcular el deliverDate
    return this.disputesService.deliverDate(id, days);
  }
  /* @Post()
  create(@Body() createDisputeDto: CreateDisputeDto) {
    return this.disputesService.create(createDisputeDto);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisputeDto: UpdateDisputeDto) {
    return this.disputesService.update(+id, updateDisputeDto);
  }

*/
}
