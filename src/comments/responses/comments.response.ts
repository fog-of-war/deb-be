import { ApiProperty } from "@nestjs/swagger";

export class CommentAuthor {
  @ApiProperty()
  user_image_url: string;

  @ApiProperty()
  user_nickname: string;
}

export class CommentResponse {
  @ApiProperty()
  comment_id: number;

  @ApiProperty()
  comment_text: string;

  @ApiProperty()
  comment_created_at: string;

  @ApiProperty()
  comment_updated_at: string;

  @ApiProperty()
  comment_author_id: number;

  @ApiProperty()
  commented_post_id: number;

  @ApiProperty()
  comment_is_deleted: boolean;
}

export class CommentResponseWithCommentAuthor extends CommentResponse {
  @ApiProperty({ type: CommentAuthor })
  comment_author: CommentAuthor;
}
