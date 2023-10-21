import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ApiProperty,
  ApiCreatedResponse,
  ApiTags,
  ApiOAuth2,
  ApiOperation,
  ApiBearerAuth,
  ApiNoContentResponse,
} from "@nestjs/swagger";
import { Response } from "express";
import {
  GoogleAuthGuard,
  NaverAuthGuard,
  KakaoAuthGuard,
  ATGuard,
  RtGuard,
} from "./guard";
import { Tokens } from "./types";
import { GetCurrentUser, GetCurrentUserInfo } from "./decorator";
import { TokensResponse } from "./response";
import { LoggerService } from "src/logger/logger.service";
// import { ThrottlerBehindProxyGuard } from '../common';
// import { Throttle } from "@nestjs/throttler";
import { UserSubCheckInterceptor } from "src/common/interceptor";

export class AuthRes {
  @ApiProperty()
  access_token: string;
}

// @UseInterceptors(UserSubCheckInterceptor)
// @UseGuards(ThrottlerBehindProxyGuard)
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService
  ) {}

  /** 구글 oauth 로그인 */
  @Get("google")
  @ApiOAuth2(["profile"])
  @ApiOperation({ summary: "구글 oauth" })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Post("google/oauth")
  @ApiOperation({ summary: "구글 oauth 로그인 & 가입" })
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type: TokensResponse,
  })
  @ApiCreatedResponse({ status: 403, description: "Forbidden." })
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<Tokens> {
    const result = await this.authService.googleLogin(req);
    // this.logger.log(`Bearer ${result.access_token}`);
    // this.logger.log(`Refresh ${result.refresh_token}`);
    res.cookie("access_token", result.access_token, {
      sameSite: "none",
      secure: true,
      httpOnly: false, // 웹소켓 연결 시 프론트에서 가져오는 작업 필요하여 false 로 설정
    });
    res.cookie("refresh_token", result.refresh_token, {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });
    return result;
  }
  /** -------------------- */

  /** 네이버 oauth 로그인 */
  @Get("naver")
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: "네이버 oauth" })
  async naverAuth(@Req() req) {}

  @Post("naver/oauth")
  @UseGuards(NaverAuthGuard)
  async naverAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.naverLogin(req);
    // this.logger.log(`Bearer ${result.access_token}`);
    // this.logger.log(`Refresh ${result.refresh_token}`);
    res.cookie("access_token", result.access_token, {
      sameSite: "none",
      secure: true,
      httpOnly: false, // 웹소켓 연결 시 프론트에서 가져오는 작업 필요하여 false 로 설정
    });
    res.cookie("refresh_token", result.refresh_token, {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });
    return result;
  }
  /** -------------------- */

  /** 카카오 oauth 로그인 */
  @Get("kakao")
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: "[승인전 사용불가]카카오 oauth" })
  async kakaoAuth(@Req() req) {}

  @Post("kakao/oauth")
  @UseGuards(KakaoAuthGuard)
  async kakaoAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.kakaoLogin(req);
    // this.logger.log(`AT : Bearer ${result.access_token}`);
    // this.logger.log(`RT : Bearer ${result.refresh_token}`);
    res.cookie("access_token", result.access_token, {
      sameSite: "none",
      secure: true,
      httpOnly: false, // 웹소켓 연결 시 프론트에서 가져오는 작업 필요하여 false 로 설정
    });
    res.cookie("refresh_token", result.refresh_token, {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });
    return result;
  }
  /** -------------------- */

  /** 로그아웃 */
  @UseGuards(ATGuard)
  @Post("logout")
  @ApiOperation({
    summary: "로그아웃 : access_token 필요",
  })
  @ApiBearerAuth("access_token")
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type: TokensResponse,
  })
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserInfo() user): Promise<boolean> {
    try {
      const result = await this.authService.logout(user["sub"]);
      this.logger.log(
        `user_id : ${user["user_email"]}님이 로그아웃 하셨습니다.`
      );
      return result;
    } catch (error) {
      this.logger.error("Logout error:", error);
      throw new ForbiddenException("Logout failed");
    }
  }
  /** -------------------- */

  /** 토큰 리프레시 */
  // @Throttle({ default: { limit: 100, ttl: 60 } })
  @UseGuards(RtGuard)
  @ApiOperation({
    summary: "리프레시 토큰 사용 및 교체: refresh_token 필요",
  })
  @ApiBearerAuth("refresh_token")
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserInfo() user: any,
    @GetCurrentUser("user_refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.authService.refreshTokens(
        user["sub"],
        refreshToken
      );
      this.logger.log(`user_id : ${user["user_email"]} 토큰 리프레시`);
      res.cookie("access_token", result.access_token, {
        sameSite: "none",
        secure: true,
        httpOnly: false, // 웹소켓 연결 시 프론트에서 가져오는 작업 필요하여 false 로 설정
      });
      res.cookie("refresh_token", result.refresh_token, {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      });
      return result;
    } catch (error) {
      this.logger.error("Token refresh error:", error);
      throw new ForbiddenException("Access Denied");
    }
  }

  /** -------------------- */

  /** 회원 탈퇴 */
  @ApiOperation({
    summary: "사용자 탈퇴 : access_token 필요",
  })
  @ApiBearerAuth("access_token")
  @ApiNoContentResponse({
    status: 204,
    description: "탈퇴 성공 시 204 반환",
  })
  @UseGuards(ATGuard)
  @Delete("leave")
  async revokeAccount(@GetCurrentUserInfo() user): Promise<any> {
    try {
      const result = await this.authService.revokeAccount(user.sub);
      this.logger.log(`user_id : ${user["user_email"]} 회원탈퇴`);
      return HttpStatus.NO_CONTENT;
      // res.status(HttpStatus.NO_CONTENT);
    } catch (error) {
      this.logger.error("Controller revokeAccount", error);
      return { message: "유저정보를 찾을 수 없습니다" };
      // return res
      //   .status(HttpStatus.NOT_FOUND)
      //   .json({ message: "유저정보를 찾을 수 없습니다" });
    }
  }
  /** -------------------- */
}
