import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_providerId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  user_image_url: string;
}
