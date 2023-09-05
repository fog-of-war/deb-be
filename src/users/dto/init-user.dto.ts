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

  @IsArray() // 추가
  @IsOptional()
  @ApiProperty({ default: [] })
  user_authored_posts: any[]; // 예시로 number[]로 가정

  @IsArray() // 추가
  @IsOptional()
  @ApiProperty({ default: [] })
  user_visited_places: any[]; // 예시로 number[]로 가정

  @IsArray() // 추가
  @IsOptional()
  @ApiProperty({ default: [] })
  user_badges: any[]; // 예시로 number[]로 가정
}
