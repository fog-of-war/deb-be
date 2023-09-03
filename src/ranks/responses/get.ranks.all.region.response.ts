import { ApiProperty } from "@nestjs/swagger";

class UserRanking {
  @ApiProperty({
    description: "유저 ID",
    example: 1,
  })
  user_id: number;

  @ApiProperty({
    description: "유저 닉네임",
    example: "구글유빈",
  })
  user_nickname: string;

  @ApiProperty({
    description: "유저 프로필이미지",
    example:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/defaultProfile.png",
  })
  user_image_url: string;

  @ApiProperty({
    description: "칭호",
    example: "부랑자",
  })
  user_selected_badge: string;

  @ApiProperty({
    description: "방문 횟수",
    example: 1,
  })
  visit_count: number;

  @ApiProperty({ description: "랭킹", example: 1 })
  rank: number;
}

export class RegionRanking {
  @ApiProperty({
    description: "지역 id",
    example: 1,
  })
  region_id: number;

  @ApiProperty({
    description: "지역명",
    example: "종로구",
  })
  region_name: string;

  @ApiProperty({
    description: "지역 영문명",
    example: "Jongno",
  })
  region_english_name: string;

  @ApiProperty({
    description: "지역 총 방문된 횟수",
    example: 2,
  })
  regionVisitCount: number;

  @ApiProperty({
    description: "지역별 유저랭킹",
    type: [UserRanking],
  })
  userRanking: UserRanking[];
}
