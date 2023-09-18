import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  comment_text: string;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  commented_post_id: number;
}
