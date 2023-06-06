/* eslint-disable prettier/prettier */
import { MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginAuthDto {

  @IsEmail()
  @ApiProperty({ description: 'Email del usuario', example: 'alexTest@gmail.com' })
  email: string;


  
  @MinLength(4)
  @MaxLength(12)
  @ApiProperty({ description: 'Password del usuario', example: 'alex123456' })
  password: string;
}
