import { ApiProperty } from "@nestjs/swagger";

class PlaceResponse {
  @ApiProperty()
  place_id: number;

  @ApiProperty()
  place_created_at: string;

  @ApiProperty()
  place_updated_at: string;

  @ApiProperty()
  place_name: string;

  @ApiProperty({ type: Number, nullable: true })
  place_star_rating: number | null;

  @ApiProperty({ type: Number, nullable: true })
  place_points: number | null;

  @ApiProperty()
  place_address: string;

  @ApiProperty()
  place_latitude: number;

  @ApiProperty()
  place_longitude: number;
}

export class GetPostResponse {
  @ApiProperty()
  post_id: number;

  @ApiProperty()
  post_created_at: string;

  @ApiProperty()
  post_updated_at: string;

  @ApiProperty({ type: String, nullable: true })
  post_description: string | null;

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

  @ApiProperty({ type: PlaceResponse })
  post_place: PlaceResponse;
}
