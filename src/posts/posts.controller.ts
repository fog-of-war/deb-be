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
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { PostsService } from "./posts.service";
import { CreatePostDto, EditPostDto } from "./dto";
import { GetUser } from "../auth/decorator";
import { ApiTags } from "@nestjs/swagger";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private postService: PostsService) {}

  @Get()
  async getPosts() {
    const result = await this.postService.getPosts();
    console.log(
      "🚀 ~ file: posts.controller.ts:30 ~ PostsController ~ getPosts ~ result:",
      result
    );
    return result;
  }

  @Get("me")
  @ApiBearerAuth("access_token")
  @UseGuards(JwtGuard)
  async getPostsByUserId(@GetUser("user_id") userId: number) {
    console.log(
      "🚀 ~ file: posts.controller.ts:39 ~ PostsController ~ getPostsByUserId ~ user_id:",
      userId
    );
    const result = await this.postService.getPostsByUserId(userId);
    return result;
  }

  @Get(":id")
  getPostById(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number
  ) {
    return this.postService.getPostById(userId, postId);
  }

  @Post()
  @ApiBearerAuth("access_token")
  @UseGuards(JwtGuard)
  @HttpCode(201)
  createPost(@GetUser("user_id") userId: number, @Body() dto: CreatePostDto) {
    try {
      // console.log(dto);
      const result = this.postService.createPost(userId, dto);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: "입력 형식을 확인하세요",
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        }
      );
    }
  }

  @Patch(":id")
  @ApiBearerAuth("access_token")
  @UseGuards(JwtGuard)
  @HttpCode(201)
  editPostById(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number,
    @Body() dto: EditPostDto
  ) {
    try {
      return this.postService.editPostById(userId, postId, dto);
    } catch (error) {
      // 에러 핸들링 코드
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: "입력 형식을 확인하세요",
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        }
      );
    }
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
