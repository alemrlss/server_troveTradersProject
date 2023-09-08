import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { Disputes, DisputesDocument } from './schema/disputes.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Disputes.name) private disputesModel: Model<DisputesDocument>,
  ) {}

  async createDispute(data: any) {
    const newDispute = new this.disputesModel(data);
    return newDispute.save();
  }

  findAll() {
    const disputes = this.disputesModel.find();
    return disputes;
  }
  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);
    try {
      // Search dispute in BD
      const dispute = await this.disputesModel.findById(id);
      if (!dispute) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
      }
      return dispute;
    } catch (error) {
      // Error
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
  }
  async handleAlertPay(
    idDispute: string,
    message: string,
    role: string,
    disputeId: string,
  ) {
    const dispute = await this.disputesModel.findById(idDispute);
    if (!dispute) {
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }

    // Verificar si ya existe una alerta con el mismo role
    const alertExists = dispute.alerts.some((alert) => alert.role === role);

    if (alertExists) {
      throw new HttpException('ALERT_ALREADY_SENT', 400); // Cambia el código de error según tu preferencia
    }
    const newAlert = { message, role, disputeId };

    dispute.alerts.push(newAlert);
    await dispute.save();
    return { success: true, message: 'Alert pushed in dispute' };
  }
  async uploadProof(
    id: string, // Parámetro de la ruta para obtener el ID de la disputa
    file: Express.Multer.File, // Archivo cargado
    role: string,
  ) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_VALID', 404);

    const dispute = await this.disputesModel.findById(id);
    if (!dispute) {
      // Manejar el caso si no se encuentra al usuario
      throw new NotFoundException('Dispute_not_found');
    }

    if (role === 'buyer') {
      if (!dispute.proofBuyer) {
        dispute.proofBuyer = file.filename;
      } else {
        throw new HttpException('ALREADY_PROOF', 400);
      }
    }
    if (role === 'seller') {
      if (!dispute.proofSeller) {
        dispute.proofSeller = file.filename;
      } else {
        throw new HttpException('ALREADY_PROOF', 400);
      }
    }

    const disputeSaved = await dispute.save();

    return disputeSaved;
  }

  async deleteProof(id: string, role: string) {
    const dispute = await this.disputesModel.findById(id);
    if (!dispute) {
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
    if (role === 'comprador') {
      dispute.proofBuyer = null;
    }
    if (role === 'vendedor') {
      dispute.proofSeller = null;
    }

    dispute.alerts = dispute.alerts.filter((alert) => alert.role !== role);

    const disputeSaved = await dispute.save();

    return disputeSaved;
  }

  async deleteDispute(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      // Search user in BD
      const admin = await this.disputesModel.findByIdAndDelete(id);
      if (!admin) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
      }
      return admin;
    } catch (error) {
      // Error
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
  }
  async deliverDate(id: string, days: number) {
    if (!mongoose.isValidObjectId(id))
      throw new HttpException('ID_NOT_FOUND', 404);

    try {
      const dispute = await this.disputesModel.findById(id);
      if (!dispute) {
        throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
      }
      // Obtener la fecha actual en UTC
      const currentDate = new Date();
      // Obtener el desplazamiento de la zona horaria local en minutos
      const timezoneOffset = currentDate.getTimezoneOffset();
      // Convertir el desplazamiento de la zona horaria local en milisegundos
      const timezoneOffsetMilliseconds = timezoneOffset * 60 * 1000;
      // Ajustar la fecha actual a UTC restando el desplazamiento de la zona horaria local
      const currentDateUTC = new Date(
        currentDate.getTime() - timezoneOffsetMilliseconds,
      );
      // Sumar los días proporcionados
      const deliveryDateUTC = new Date(
        currentDateUTC.getTime() + days * 24 * 60 * 60 * 1000,
      );

      // Convertir la fecha de entrega de nuevo a la zona horaria local si es necesario
      // const deliveryDateLocal = new Date(deliveryDateUTC.getTime() + timezoneOffsetMilliseconds);

      dispute.deliverDate = deliveryDateUTC;

      dispute.save();
      return dispute;
    } catch (error) {
      // Error
      throw new HttpException('ID_NOT_FOUND_OBJECT', 403);
    }
  }
  /* create(createDisputeDto: CreateDisputeDto) {
    return 'This action adds a new dispute';
  }



  update(id: number, updateDisputeDto: UpdateDisputeDto) {
    return `This action updates a #${id} dispute`;
  }

  remove(id: number) {
    return `This action removes a #${id} dispute`;
  }
*/
}
