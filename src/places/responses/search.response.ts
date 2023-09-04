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
  naver_place_url: string;

  @ApiProperty({ required: false }) // 옵셔널 필드
  place_posts: any[];

  @ApiProperty({ required: false }) // 옵셔널 필드
  place_posts_id: any[];

  @ApiProperty({ required: false }) // 옵셔널 필드
  place_star_rating: number;

  @ApiProperty({ type: PlaceCategory, isArray: true, required: false })
  place_category_map: PlaceCategory[];
}
