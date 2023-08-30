// place.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class landmarksResponse {
  @ApiProperty()
  place_id: number;

  @ApiProperty()
  place_created_at: string;

  @ApiProperty()
  place_updated_at: string;

  @ApiProperty()
  place_name: string;

  @ApiProperty()
  place_star_rating: number | null;

  @ApiProperty()
  place_points: number | null;

  @ApiProperty()
  place_address: string;

  @ApiProperty()
  place_region_id: number;

  @ApiProperty()
  place_latitude: number;

  @ApiProperty()
  place_longitude: number;
}
