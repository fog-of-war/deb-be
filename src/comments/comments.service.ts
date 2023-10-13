import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AlertService } from "src/alert/alert.service";

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private readonly alertService: AlertService
  ) {}
  /** -------------------- */

  /** 댓글 생성하기 */
  async create(userId, CreateCommentDto) {
    const { comment_text, commented_post_id } = CreateCommentDto;
    const post = await this.prisma.post.findFirst({
      where: { post_id: commented_post_id },
    });
    if (!post) {
      throw new HttpException(
        "해당 게시물이 존재하지 않습니다",
        HttpStatus.NOT_FOUND
      );
    }
    const data = {
      comment_text: comment_text,
      comment_author_id: userId,
      commented_post_id: commented_post_id,
    };
    const result = await this.prisma.comment.create({ data: data });
    const message = await this.alertService.createActivityAlert(
      result.comment_id,
      post.post_author_id
    );
    return result;
  }
  /** -------------------- */

  /** 댓글 가져오기 (comment_id 사용)*/
  async findOne(id: number) {
    const result = await this.prisma.comment.findFirst({
      where: { comment_id: id },
    });
    if (!result) {
      throw new HttpException(
        "해당 댓글이 존재하지 않습니다",
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }
  /** -------------------- */

  /** 댓글 수정하기*/
  async update(userId, id: number, updateCommentDto: any) {
    const existingComment = await this.prisma.comment.findFirst({
      where: { comment_id: id },
    });
    if (!existingComment) {
      throw new NotFoundException("해당 댓글이 존재하지 않습니다");
    }
    const data = {
      comment_text: updateCommentDto.comment_text,
      comment_updated_at: new Date().toISOString(),
    };
    const result = await this.prisma.comment.update({
      where: { comment_id: id },
      data: data,
    });
    return `commnet_id : #${id} 댓글 수정완료`;
  }
  /** -------------------- */

  /** 댓글 삭제하기*/
  async remove(id: number) {
    const existingComment = await this.prisma.comment.findFirst({
      where: { comment_id: id },
    });
    if (!existingComment) {
      throw new NotFoundException("해당 댓글이 존재하지 않습니다");
    }
    await this.prisma.comment.delete({ where: { comment_id: id } });
    return `commnet_id : #${id} 댓글 삭제완료`;
  }
  /** -------------------- */
}
