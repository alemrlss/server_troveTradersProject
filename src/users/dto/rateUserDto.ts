/* eslint-disable prettier/prettier */

import {
  IsDateString,
  IsString,
  Length,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class rateUserDto {
  @IsInt()
  @Min(0)
  @Max(5)
  newRating: number;

  @IsString()
  @Length(1, 500)
  comment: string;

  @IsDateString()
  timestamp: Date;
}
