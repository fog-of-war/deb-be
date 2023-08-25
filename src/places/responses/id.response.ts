import { ApiProperty } from "@nestjs/swagger";
class Post {
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

class Category {
  @ApiProperty()
  category_id: number;

  @ApiProperty()
  category_name: string;

  @ApiProperty()
  category_points: number;

  @ApiProperty()
  category_created_at: string;

  @ApiProperty()
  category_updated_at: string;
}

class PlaceCategory {
  @ApiProperty()
  placeId: number;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  category: Category;
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

export class GetPlaceById {
  @ApiProperty()
  place_id: number;

  @ApiProperty()
  place_created_at: Date;

  @ApiProperty()
  place_updated_at: Date;

  @ApiProperty()
  place_name: string;

  @ApiProperty()
  place_star_rating: number;

  @ApiProperty()
  place_points: number;

  @ApiProperty()
  place_address: string;

  @ApiProperty()
  place_latitude: number;

  @ApiProperty()
  place_longitude: number;

  @ApiProperty({ type: [Post] })
  place_posts: any[];

  @ApiProperty({ type: [PlaceCategory] })
  place_category_map: any[];

  @ApiProperty({ type: [VisitedPlace] })
  place_visited_by: any[];
}
