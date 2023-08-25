import { ApiProperty } from "@nestjs/swagger";

class Badge {
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
}

class VisitedPlace {
  @ApiProperty()
  visited_id: number;

  @ApiProperty()
  visited_date: string;

  @ApiProperty()
  visited_place_id: number;

  @ApiProperty()
  visited_user_id: number;
}

class AuthoredPost {
  @ApiProperty()
  post_id: number;

  @ApiProperty()
  post_created_at: string;

  @ApiProperty()
  post_updated_at: string;

  @ApiProperty()
  post_description: string;

  @ApiProperty()
  post_image_url: string;

  @ApiProperty()
  post_author_id: number;

  @ApiProperty()
  post_star_rating: number;

  @ApiProperty()
  post_place_id: number;

  @ApiProperty()
  post_is_deleted: boolean;
}

export class GetUserResponse {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  user_image_url: string;

  @ApiProperty()
  user_nickname: string;

  @ApiProperty()
  user_points: number;

  @ApiProperty()
  user_level: number;

  @ApiProperty()
  user_is_admin: string;

  @ApiProperty()
  user_is_deleted: boolean;

  @ApiProperty({ type: [Badge] })
  user_badges: Badge[];

  @ApiProperty({ type: [VisitedPlace] })
  user_visited_places: VisitedPlace[];

  @ApiProperty({ type: [AuthoredPost] })
  user_authored_posts: AuthoredPost[];
}
