import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsNumber, IsString, IsUrl } from "class-validator";

class Badge {
  @ApiProperty()
  @IsNumber()
  badge_id: number;

  @ApiProperty()
  @IsString()
  badge_name: string;

  @ApiProperty()
  @IsNumber()
  badge_category_id: number;

  @ApiProperty()
  @IsNumber()
  badge_criteria: number;

  @ApiProperty()
  @IsNumber()
  badge_points: number;

  @ApiProperty()
  @IsNumber()
  badge_user_id: number;
}

class VisitedPlace {
  @ApiProperty()
  @IsNumber()
  visited_id: number;

  @ApiProperty()
  @IsDate()
  visited_date: Date;

  @ApiProperty()
  @IsNumber()
  visited_place_id: number;

  @ApiProperty()
  @IsNumber()
  visited_user_id: number;
}

class AuthoredPost {
  @ApiProperty()
  @IsNumber()
  post_id: number;

  @ApiProperty()
  @IsDate()
  post_created_at: Date;

  @ApiProperty()
  @IsDate()
  post_updated_at: Date;

  @ApiProperty()
  @IsString()
  post_description: string;

  @ApiProperty()
  @IsUrl()
  post_image_url: string;

  @ApiProperty()
  @IsNumber()
  post_author_id: number;

  @ApiProperty()
  @IsNumber()
  post_star_rating: number;

  @ApiProperty()
  @IsNumber()
  post_place_id: number;

  @ApiProperty()
  @IsBoolean()
  post_is_deleted: boolean;
}

export class GetUserResponse {
  @ApiProperty()
  @IsNumber()
  user_id: number;

  @ApiProperty()
  @IsUrl()
  user_image_url: string;

  @ApiProperty()
  @IsString()
  user_nickname: string;

  @ApiProperty()
  @IsNumber()
  user_points: number;

  @ApiProperty()
  @IsNumber()
  user_level: number;

  @ApiProperty()
  @IsString()
  user_is_admin: string;

  @ApiProperty()
  @IsBoolean()
  user_is_deleted: boolean;

  @ApiProperty({ type: [Badge] })
  @IsArray()
  user_badges: Badge[];

  @ApiProperty({ type: [VisitedPlace] })
  @IsArray()
  user_visited_places: VisitedPlace[];

  @ApiProperty({ type: [AuthoredPost] })
  @IsArray()
  user_authored_posts: AuthoredPost[];
}
