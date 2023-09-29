import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { EventsGateway } from "src/events/events.gateway";
import { AlertService } from "src/alert/alert.service";

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly alertService: AlertService
  ) {}

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
    // const message = await this.alertService.createActivityAlert(
    //   result.comment_id
    // );
    // await this.eventsGateway.server.to("/ws-react").emit("message", message);
    return result;
    // return "댓글 작성에 성공하였습니다";
  }

  findAll() {
    return `This action returns all comments`;
  }

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

  async update(userId, id: number, updateCommentDto: any) {
    // 1. 해당 ID의 댓글이 실제로 존재하는지 확인
    const existingComment = await this.prisma.comment.findFirst({
      where: { comment_id: id },
    });

    if (!existingComment) {
      // 2. 댓글이 존재하지 않는 경우 404 오류 반환
      throw new NotFoundException("해당 댓글이 존재하지 않습니다");
    }
    // 3. 댓글이 존재하는 경우 업데이트 작업 수행
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

  async remove(id: number) {
    // 1. 해당 ID의 댓글이 실제로 존재하는지 확인
    const existingComment = await this.prisma.comment.findFirst({
      where: { comment_id: id },
    });

    if (!existingComment) {
      // 2. 댓글이 존재하지 않는 경우 404 오류 반환
      throw new NotFoundException("해당 댓글이 존재하지 않습니다");
    }

    await this.prisma.comment.delete({ where: { comment_id: id } });

    return `commnet_id : #${id} 댓글 삭제완료`;
  }
}
