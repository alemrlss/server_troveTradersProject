/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
/* eslint-disable prettier/prettier */
export class UpdateUserDto {
  @ApiProperty({ description: 'name', example: 'Kevin' })
  name: string;
  @ApiProperty({ description: 'lastname', example: 'Borras' })
  lastName: string;
  @ApiProperty({ description: 'username', example: 'kevinjb' })
  username: string;
  @ApiProperty({ description: 'gender', example: 'male' })
  gender: string;
}
