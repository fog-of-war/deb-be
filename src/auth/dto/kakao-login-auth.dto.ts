import { IsOptional, IsString } from "class-validator";

export class KakaoLoginAuthOutputDto {
  @IsOptional()
  @IsString()
  accessToken?: string;
}
