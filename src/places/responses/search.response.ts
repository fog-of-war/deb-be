import { ApiProperty } from "@nestjs/swagger";
import { PlaceCategory } from "./place.category";
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
  distance: number;

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
  x: number;

  @ApiProperty()
  y: number;

  @ApiProperty()
  place_posts: any[];
  @ApiProperty()
  place_posts_id: any[];
  @ApiProperty()
  place_star_rating: number;

  @ApiProperty({ type: PlaceCategory, isArray: true })
  place_category_map: PlaceCategory[];
}
