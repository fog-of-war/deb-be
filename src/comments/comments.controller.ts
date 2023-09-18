import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { GetCurrentUserId } from "../auth/decorator";
import { ATGuard } from "src/auth/guard";
import { LoggerService } from "src/logger/logger.service";

@Controller("comments")
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private logger: LoggerService
  ) {}

  @Post()
  @UseGuards(ATGuard)
  create(
    @GetCurrentUserId() userId: number,
    @Body() createCommentDto: CreateCommentDto
  ) {
    const result = this.commentsService.create(userId["sub"], createCommentDto);
    this.logger.log("댓글 작성한 사람", userId["user_email"]);
    return result;
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(ATGuard)
  update(
    @GetCurrentUserId() userId: number,
    @Param("id") commentId: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const result = this.commentsService.update(
      userId["sub"],
      commentId,
      updateCommentDto
    );
    this.logger.log("댓글 수정한 사람", userId["user_email"]);
    return result;
  }

  @Delete(":id")
  @UseGuards(ATGuard)
  remove(@GetCurrentUserId() userId: number, @Param("id") commentId: number) {
    const result = this.commentsService.remove(commentId);
    this.logger.log("댓글 삭제하는 사람", userId["user_email"]);
    return result;
  }
}
