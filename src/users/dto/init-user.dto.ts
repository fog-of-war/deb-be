import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsArray, // 추가
} from "class-validator";

export class InitUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_providerId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_email: string;

  @IsArray() 
  @IsOptional()
  @ApiProperty({ default: [] })
  user_authored_posts: any[]; 

  @IsArray() 
  @IsOptional()
  @ApiProperty({ default: [] })
  user_visited_places: any[]; 

  @IsArray()
  @IsOptional()
  @ApiProperty({ default: [] })
  user_badges: any[];
}
