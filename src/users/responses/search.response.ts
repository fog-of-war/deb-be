import { ApiProperty } from "@nestjs/swagger";

export class PlaceCategory {
  @ApiProperty()
  placeId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  category: {
    category_id: string;
    category_name: string;
    category_points: string;
    category_created_at: string;
    category_updated_at: string;
  };
}

export class SearchResponse {
  @ApiProperty()
  address_name: string;

  @ApiProperty()
  category_group_code: string;

  @ApiProperty()
  category_group_name: string;

  @ApiProperty()
  category_name: string;

  @ApiProperty()
  distance: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  place_name: string;

  @ApiProperty()
  place_url: string;

  @ApiProperty()
  road_address_name: string;

  @ApiProperty()
  x: string;

  @ApiProperty()
  y: string;

  @ApiProperty()
  place_posts: string[];

  @ApiProperty()
  place_star_rating: string;

  @ApiProperty({ type: [PlaceCategory] })
  place_category_map: PlaceCategory[];
}

export class SearchResponsesArray {
  @ApiProperty({ type: [SearchResponse] })
  responses: SearchResponse[];
}
