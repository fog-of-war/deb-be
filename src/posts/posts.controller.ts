import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { PostsService } from "./posts.service";
import { CreatePostDto, EditPostDto } from "./dto";
import { GetUser } from "../auth/decorator";
import { ApiTags } from "@nestjs/swagger";
@ApiTags("posts")
@UseGuards(JwtGuard)
@Controller("posts")
export class PostsController {
  constructor(private postService: PostsService) {}

  @Get()
  getPosts() {
    return this.postService.getPosts();
  }
  @Get()
  getPostsByUserId(@GetUser("user_id") userId: number) {
    return this.postService.getPostsByUserId(userId);
  }

  @Get(":id")
  getPostById(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number
  ) {
    return this.postService.getPostById(userId, postId);
  }

  @Post()
  createPost(@GetUser("user_id") userId: number, @Body() dto: CreatePostDto) {
    try {
      const result = this.postService.createPost(userId, dto);
      return result;
    } catch (error) {
      // 에러 핸들링 코드
      return { message: "Error occurred during post creation.", error };
    }
  }

  @Patch(":id")
  editPostById(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number,
    @Body() dto: EditPostDto
  ) {
    return this.postService.editPostById(userId, postId, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  deletePost(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number
  ) {
    return this.postService.deletePostById(userId, postId);
  }
}
