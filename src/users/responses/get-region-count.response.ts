import { ApiProperty } from "@nestjs/swagger";

export class RegionWithVisitedCountDto {
  @ApiProperty()
  region_id: number;

  @ApiProperty()
  region_name: string;

  @ApiProperty()
  region_visited_count: number;

  @ApiProperty()
  region_english_name: string;
}
