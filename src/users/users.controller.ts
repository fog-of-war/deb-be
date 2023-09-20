import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Res,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
// import { User } from "@prisma/client";
import { GetCurrentUserId, GetUser } from "../auth/decorator";
import { ATGuard, JwtGuard } from "../auth/guard";
import { UsersService } from "./users.service";
import { ChangeUserTitleDto, EditUserDto } from "./dto";
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from "@nestjs/swagger";
import { validate } from "class-validator";
import {
  EditUserResponse,
  GetUserBadgeResponse,
  GetUserResponse,
  RegionWithVisitedCountDto,
} from "./responses";
import { LoggerService } from "src/logger/logger.service";
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from "@nestjs/cache-manager";

@ApiTags("users")
@UseGuards(ATGuard)
@Controller("users")
export class UsersController {
  constructor(
    private userService: UsersService,
    private logger: LoggerService
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10)
  @Get("me")
  @ApiOperation({ summary: "나의 정보 가져오기/ 마이페이지, 메인페이지 사용" })
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "",
    type: GetUserResponse, // 반환 모델을 지정
  })
  async getMe(@GetCurrentUserId() userId: number) {
    const result = await this.userService.findUserById(userId["sub"]);
    this.logger.log("자신의 회원정보 호출한 사람", userId["user_email"]);
    return result;
  }

  @Get("me/mypage")
  @ApiOperation({ summary: "나의 정보 가져오기/ 마이페이지, 메인페이지 사용" })
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "",
    type: GetUserResponse, // 반환 모델을 지정
  })
  async getMyPage(@GetCurrentUserId() userId: number) {
    const result = await this.userService.findUserById(userId["sub"]);
    this.logger.log("자신의 회원정보 호출한 사람", userId["user_email"]);
    // this.logger.log("자신의 회원정보 호출 결과", result);
    return result;
  }

  @Patch("me")
  @UseGuards(ATGuard)
  @ApiOperation({
    summary:
      "나의 정보 수정하기 / 프로필이미지, 닉네임, 변경 가능 (칭호 변경 기능 개발중)",
  })
  @ApiBearerAuth("access_token")
  @HttpCode(201)
  @ApiResponse({
    status: 200,
    description: "",
    type: EditUserResponse, // 이 부분 수정
  })
  async editUser(@GetCurrentUserId() userId: number, @Body() dto: EditUserDto) {
    // 유효성 검사 수행
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorResponse = {
        message: "Validation failed",
        errors: errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints).join(", "),
        })),
      };
      throw new UnprocessableEntityException(errorResponse);
    }
    try {
      await this.userService.editUser(userId["sub"], dto);
      this.logger.log(`${userId["user_email"]}의 회원 정보 변경`);
      return { message: "유저 정보 변경에 성공했습니다" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10)
  @Get("me/badges")
  @ApiOperation({ summary: "사용자의 소유한 뱃지 조회" }) // API 설명
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "사용자가 소유한 뱃지 정보",
    type: GetUserBadgeResponse,
  })
  async getMyBadges(@GetCurrentUserId() userId: number) {
    const result = await this.userService.findUserBadges(userId["sub"]);
    this.logger.log(`${userId["user_email"]} 뱃지 정보 호출`);
    return result;
  }

  @Patch("me/title")
  @ApiOperation({
    summary: "나의 칭호 변경하기",
  })
  @ApiBearerAuth("access_token")
  @HttpCode(201)
  @ApiResponse({
    status: 200,
    description: "",
    type: EditUserResponse, // 이 부분 수정
  })
  async changeTitle(
    @GetCurrentUserId() userId: number,
    @Body() dto: ChangeUserTitleDto,
    @Res() res
  ) {
    // 유효성 검사 수행
    try {
      await this.userService.changeTitle(userId["sub"], dto);
      this.logger.log(`${userId["user_email"]}의 대표 칭호 변경`);
      return { message: "유저 칭호 변경에 성공했습니다" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10)
  @Get("me/region")
  @ApiOperation({ summary: "사용자가 방문한 구역 정보 및 횟수 전달" }) // API 설명
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "사용자가 방문한 구역 정보 및 횟수",
    type: [RegionWithVisitedCountDto],
  })
  async getMyVisitedRegionCount(
    @GetCurrentUserId() userId: number,
    @Res() res
  ) {
    try {
      const result = await this.userService.getMyVisitedRegionCount(
        userId["sub"]
      );
      this.logger.log(
        `user_id : ${userId["user_email"]} 구역 정보 및 횟수 조회`
      );
      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "유저정보를 찾을 수 없습니다" });
    }
  }

  @Delete("me/leave")
  @ApiOperation({ summary: "사용자 탈퇴" }) // API 설명
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "탈퇴성공",
  })
  async leaveService(@GetCurrentUserId() userId: number, @Res() res) {
    try {
      const result = await this.userService.leaveService(userId["sub"]);
      this.logger.log(`user_id : ${userId["user_email"]} 회원탈퇴`);
      return res.status(HttpStatus.NO_CONTENT).json(result);
    } catch (error) {
      console.log(
        "🚀 ~ file: users.controller.ts:168 ~ UsersController ~ leaveService ~ error:",
        error
      );
      // 에러 발생 시 에러 메시지를 응답으로 보내기
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "유저정보를 찾을 수 없습니다" });
    }
  }
}
