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
  @IsString()
  @Length(1, 140)
  @ApiProperty()
  place_name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(5.0)
  @ApiProperty()
  post_star_rating?: number;

  @IsString()
  @IsOptional()
  @Length(1, 140)
  @ApiProperty()
  post_description?: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  post_image_url: string;

  // 추가된 부분: 위치 정보 필드
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  place_latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  place_longitude: number;
}
