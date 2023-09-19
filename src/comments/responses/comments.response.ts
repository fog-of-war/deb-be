// {
//   "comment_id": 1,
//   "comment_text": "우왕",
//   "comment_created_at": "2023-09-18T08:50:36.212Z",
//   "comment_updated_at": "2023-09-18T08:50:36.212Z",
//   "comment_author_id": 1,
//   "commented_post_id": 1,
//   "comment_is_deleted": false
// }

import { ApiProperty } from "@nestjs/swagger";

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
