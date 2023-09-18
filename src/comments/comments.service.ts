import { Injectable } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId, CreateCommentDto) {
    const { comment_text, commented_post_id } = CreateCommentDto;
    const data = {
      comment_text: comment_text,
      comment_author_id: userId,
      commented_post_id: commented_post_id,
    };
    const result = await this.prisma.comment.create({ data: data });
    console.log(result);
    return "This action adds a new comment";
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(userId, id: number, updateCommentDto: any) {
    const data = {
      comment_text: UpdateCommentDto["comment_text"],
      comment_updated_at: new Date().toISOString(),
    };
    const result = await this.prisma.comment.update({
      where: { comment_id: id },
      data: data,
    });
    console.log(result);
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
