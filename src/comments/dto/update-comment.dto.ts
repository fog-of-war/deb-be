import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  comment_text: string;
}
