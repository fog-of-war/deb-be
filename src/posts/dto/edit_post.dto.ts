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
}
