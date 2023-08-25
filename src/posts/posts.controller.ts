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
import { ApiTags, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { GetPostResponse, PostPostsResponse } from "./responses";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private postService: PostsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetPostResponse], // 반환 모델을 지정
  })
  async getPosts() {
    const result = await this.postService.getPosts();
    console.log(
      "🚀 ~ file: posts.controller.ts:30 ~ PostsController ~ getPosts ~ result:",
      result
    );
    return result;
  }

  @Get("me")
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetPostResponse], // 반환 모델을 지정
  })
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
  @ApiResponse({
    status: 200,
    description: "",
    type: GetPostResponse, // 반환 모델을 지정
  })
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
  @ApiResponse({
    status: 200,
    description: "",
    type: PostPostsResponse, // 반환 모델을 지정
  })
  async createPost(
    @GetUser("user_id") userId: number,
    @Body() dto: CreatePostDto
  ) {
    try {
      //
      const result = await this.postService.createPost(userId, dto);
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
  async editPostById(
    @GetUser("user_id") userId: number,
    @Param("id", ParseIntPipe) postId: number,
    @Body() dto: EditPostDto
  ) {
    try {
      const result = await this.postService.editPostById(userId, postId, dto);
      return result;
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
