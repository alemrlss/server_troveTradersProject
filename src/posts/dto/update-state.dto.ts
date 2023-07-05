/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class UpdateStateDto {
  @IsNotEmpty()
  newState: string;
}
