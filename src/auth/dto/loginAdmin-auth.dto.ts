/* eslint-disable prettier/prettier */
import { MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginAdminAuthDto {

  @IsEmail()
  @ApiProperty({ description: 'Email del Admin', example: 'alexTest@gmail.com' })
  email: string;

  
  @MinLength(4)
  @MaxLength(12)
  @ApiProperty({ description: 'Password del Admin', example: 'alex123456' })
  password: string;
}
