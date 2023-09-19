import { ApiProperty } from "@nestjs/swagger";

export class PlaceWithPostsResponse {
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
  post_author: {
    user_id: number;
    user_nickname: string;
    user_image_url: string;
  };

  @ApiProperty()
  post_comments: {
    comment_id: number;
    comment_text: string;
    comment_created_at: string;
    comment_updated_at: string;
    comment_author_id: number;
    commented_post_id: number;
    comment_is_deleted: boolean;
  };
}
