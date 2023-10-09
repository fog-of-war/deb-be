import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
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
  @IsNotEmpty()
  @ApiProperty()
  user_oauth_token: string;
}
