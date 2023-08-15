/* eslint-disable prettier/prettier */

import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminAuthDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email del admin',
    example: 'alexTestAdmin@gmail.com',
  })
  email: string;

  @MinLength(4)
  @MaxLength(12)
  @ApiProperty({ description: 'Password del administrador', example: 'alex123456' })
  password: string;
}
