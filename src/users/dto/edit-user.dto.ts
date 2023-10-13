import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class EditUserDto {
  @IsString()
  @IsOptional()
  @Length(1, 10)
  @ApiProperty()
  user_nickname?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty()
  user_image_url?: string;
}
