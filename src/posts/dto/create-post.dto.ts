/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Categories } from '../schema/posts.schema';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'title', example: 'Zapatos de verano' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'description',
    example: 'Los mejores zapatos del mercado',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'price', example: '200$' })
  price: string;

  @IsArray()
  photos: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'authorID', example: 'objectID' })
  author_id: string;

  @IsBoolean()
  @IsNotEmpty()
  confirmationAgreement: boolean;

  @IsBoolean()
  @IsNotEmpty()
  confirmationPayment: boolean;

  @IsBoolean()
  @IsNotEmpty()
  confirmationDelivery: boolean;

  @IsEnum(Categories)
  @ApiProperty({ description: 'category', enum: Categories })
  category: Categories;
}
