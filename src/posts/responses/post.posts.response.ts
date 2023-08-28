import { ApiProperty } from "@nestjs/swagger";

class BadgeInfo {
  @ApiProperty({ description: "뱃지 ID" })
  badge_id: number;

  @ApiProperty({ description: "뱃지 이름" })
  badge_name: string;

  @ApiProperty({ description: "뱃지 카테고리" })
  badge_category_id: number;

  @ApiProperty({ description: "뱃지 획득 조건" })
  badge_criteria: number;

  @ApiProperty({ description: "뱃지 획득 시 부여 포인트" })
  badge_points: number;

  @ApiProperty({ description: "뱃지를 획득한 사용자 ID" })
  badge_user_id: number;

  @ApiProperty({ description: "뱃지 이미지 url" })
  badge_image_url: string;
}

export class StateInfo {
  @ApiProperty({ description: "게시글 작성 후 레벨업" })
  new_level?: number;

  @ApiProperty({
    description: "게시글 작성 후 신규 뱃지 획득",
    type: [BadgeInfo], // 이 부분을 추가하여 뱃지 배열임을 명시
  })
  new_badges?: BadgeInfo[];
}

export class PostPostsResponse {
  @ApiProperty({ description: "state 정보" })
  state?: StateInfo;
}
