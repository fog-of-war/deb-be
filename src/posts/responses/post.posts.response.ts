import { ApiProperty } from "@nestjs/swagger";

class BadgeInfo {
  @ApiProperty()
  badge_id: number;

  @ApiProperty()
  badge_name: string;

  @ApiProperty()
  badge_category_id: number;

  @ApiProperty()
  badge_criteria: number;

  @ApiProperty()
  badge_points: number;

  @ApiProperty()
  badge_user_id: number;

  constructor(data: Partial<BadgeInfo>) {
    Object.assign(this, data);
  }
}

export class PostPostsResponse {
  @ApiProperty()
  state: {
    new_level?: number;
    new_badges?: BadgeInfo[];
  };
}
