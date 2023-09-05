import { ApiProperty } from "@nestjs/swagger";

export class PlaceCategory {
  @ApiProperty()
  placeId: number;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  category: {
    category_id: number;
    category_name: string;
    category_points: number;
    category_created_at: string;
    category_updated_at: string;
  };
}
