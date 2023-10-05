/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
/* eslint-disable prettier/prettier */
export class CompleteRegisterDto {
  @ApiProperty({ description: 'Address', example: 'av 74 con calle 88' })
  address: string;
  @ApiProperty({ description: 'Phone', example: '04248885612' })
  phone: string;
  @ApiProperty({ description: 'gender', example: 'male' })
  gender: string;
}
