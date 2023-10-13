
import { ApiProperty } from "@nestjs/swagger";

export class BadgeResponse {
      @ApiProperty()
      badge_id: number;
      @ApiProperty()
      badge_name: string;
      @ApiProperty()
      badge_category_id: number;
      @ApiProperty()
      badge_criteria: number;
      @ApiProperty()
      badge_points: number;
      @ApiProperty()
      badge_image_url: string;
}