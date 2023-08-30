import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class ChangeUserTitleDto {
  @IsString()
  @ApiProperty()
  user_selected_badge: number;
}
