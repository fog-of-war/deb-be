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
import { SetPublic } from "./docorator";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private postService: PostsService) {}

  @Get()
  @SetPublic()
  getPosts() {
    console.log("안녕");
    const result = this.postService.getPosts();
    console.log(result);
    return result;
  }

  @Get("me")
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
  createPost(@GetUser("user_id") userId: number, @Body() dto: CreatePostDto) {
    try {
      console.log(dto);
      const result = this.postService.createPost(userId, dto);
      return result;
    } catch (error) {
      // 에러 핸들링 코드
      return { message: "Error occurred during post creation.", error };
    }
  }

  @Patch(":id")
  @UseGuards(JwtGuard)
  editPostById(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number,
    @Body() dto: EditPostDto
  ) {
    return this.postService.editPostById(userId, postId, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(JwtGuard)
  deletePost(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number
  ) {
    return this.postService.deletePostById(userId, postId);
  }
}
