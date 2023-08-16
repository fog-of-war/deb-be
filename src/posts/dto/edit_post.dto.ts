import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from "class-validator";

export class EditPostDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  title?: string;

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
}
