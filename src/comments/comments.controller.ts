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
    this.logger.log("댓글 작성한 사람", userId["user_email"]);
    return this.commentsService.create(userId["sub"], createCommentDto);
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
    return this.commentsService.update(
      userId["sub"],
      commentId,
      updateCommentDto
    );
  }

  @Delete(":id")
  @UseGuards(ATGuard)
  remove(@Param("id") id: string) {
    return this.commentsService.remove(+id);
  }
}
