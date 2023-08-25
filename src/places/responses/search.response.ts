import { ApiProperty } from "@nestjs/swagger";

export class PlaceCategory {
  @ApiProperty()
  placeId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  category: any; // 여기에 원하시는 형식의 객체를 정의하십시오.
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

  @ApiProperty({ type: PlaceCategory, isArray: true })
  place_category_map: PlaceCategory[];
}
