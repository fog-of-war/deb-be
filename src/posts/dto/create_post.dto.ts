import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsUrl,
  IsNotEmpty,
  Min,
  IsNumber,
  Max,
  Length,
} from "class-validator";

export class CreatePostDto {
  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(5.0)
  @ApiProperty()
  star_rating?: number;

  @IsString()
  @IsOptional()
  @Length(1, 140)
  @ApiProperty()
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  image_url: string;

  // 추가된 부분: 위치 정보 필드
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  longitude: number;
}
