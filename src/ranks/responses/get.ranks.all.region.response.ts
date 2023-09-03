import { Controller, Get } from "@nestjs/common";
import { ApiProperty, ApiTags } from "@nestjs/swagger";

class User {
  @ApiProperty({
    description: "유저아이디",
    example: 1,
  })
  user_id: number;

  @ApiProperty({
    description: "유저닉네임",
    example: "구글유빈",
  })
  user_nickname: string;

  @ApiProperty({
    description: "유저이미지url",
    example:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/defaultProfile.png",
  })
  user_image_url: string;

  @ApiProperty({
    description: "방문횟수",
    example: 1,
  })
  visitCount: number;
}
