import { ApiProperty } from "@nestjs/swagger";
import {  IsNumber } from "class-validator";

export class ChangeUserTitleDto {
  @IsNumber()
  @ApiProperty()
  user_selected_badge_id: number;
}
