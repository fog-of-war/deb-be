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
  Res,
  UseFilters,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { ATGuard, JwtGuard } from "../auth/guard";
import { PostsService } from "./posts.service";
import { CreatePostDto, EditPostDto } from "./dto";
import { GetCurrentUserId, GetUser } from "../auth/decorator";
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { GetPostResponse, PostPostsResponse } from "./responses";
import { LoggerService } from "src/logger/logger.service";
import { UnauthorizedExceptionFilter } from "../filters";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(
    private postService: PostsService,
    private logger: LoggerService
  ) {}

  @Get()
  @ApiOperation({ summary: "모든 게시물 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetPostResponse], // 반환 모델을 지정
  })
  async getPosts() {
    const result = await this.postService.getPosts();
    return result;
  }

  @Get("me")
  @ApiOperation({ summary: "나의 게시물 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetPostResponse], // 반환 모델을 지정
  })
  @ApiBearerAuth("access_token")
  @UseGuards(ATGuard)
  async getPostsByUserId(@GetCurrentUserId() userId: number) {
    const result = await this.postService.getPostsByUserId(userId["sub"]);
    this.logger.log(userId["user_email"], "가 자신의 게시물 호출");
    return result;
  }

  @Get(":id")
  @ApiOperation({ summary: "특정 id 값을 가진 게시물 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: GetPostResponse, // 반환 모델을 지정
  })
  getPostById(@Param("id", ParseIntPipe) postId: number) {
    return this.postService.getPostById(postId);
  }

  @Post()
  @UseFilters(UnauthorizedExceptionFilter)
  @ApiOperation({
    summary: "게시물 생성하기 / 레벨, 뱃지에 변동 시 해당 결과 반환",
  })
  @ApiBearerAuth("access_token")
  @UseGuards(ATGuard)
  @HttpCode(201)
  @ApiResponse({
    status: 200,
    description: "",
    type: PostPostsResponse, // 반환 모델을 지정
  })
  async createPost(
    @GetCurrentUserId() userId: number,
    @Body() dto: CreatePostDto,
    @Res() res
  ) {
    try {
      const result = await this.postService.createPost(userId["sub"], dto);
      this.logger.log(userId["user_email"], "가 게시물 작성");
      res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      throw error;
    }
  }

  @Patch(":id")
  @ApiOperation({ summary: "게시물 수정하기 / 별점과 설명만 수정가능" })
  @ApiBearerAuth("access_token")
  @UseGuards(ATGuard)
  @HttpCode(201)
  async editPostById(
    @GetCurrentUserId() userId: number,
    @Param("id", ParseIntPipe) postId: number,
    @Body() dto: EditPostDto
  ) {
    try {
      const result = await this.postService.editPostById(
        userId["sub"],
        postId,
        dto
      );
      this.logger.log(`${userId["user_email"]}가 게시물 ${postId} 수정`);
      return result;
    } catch (error) {
      // 에러 핸들링 코드
      throw error;
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "특정 id 값을 가진 게시물 삭제하기" })
  @HttpCode(204)
  @ApiBearerAuth("access_token")
  @UseGuards(ATGuard)
  async deletePost(
    @GetCurrentUserId() userId: number,
    @Param("id", ParseIntPipe) postId: number
  ) {
    try {
      const result = await this.postService.deletePostById(
        userId["sub"],
        postId
      );

      if (!result) {
        this.logger.log(`${userId["user_email"]}가 게시물 ${postId} 삭제실패`);
        throw new NotFoundException("게시물을 찾을 수 없습니다.");
      }
      this.logger.log(`${userId["user_email"]}가 게시물 ${postId} 삭제`);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        // 게시물을 찾을 수 없는 경우 404 응답을 보냅니다.
        throw new NotFoundException("게시물을 찾을 수 없습니다.");
      }
      // 다른 예외 처리가 필요한 경우 처리할 수 있습니다.
      throw error;
    }
  }
}
