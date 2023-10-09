import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ApiProperty,
  ApiCreatedResponse,
  ApiTags,
  ApiOAuth2,
  ApiOperation,
  ApiBearerAuth,
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
import { GetCurrentUser, GetCurrentUserId } from "./decorator";
import { TokensResponse } from "./response";
import { LoggerService } from "src/logger/logger.service";

export class AuthRes {
  @ApiProperty()
  access_token: string;
}

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
    console.log(`Bearer ${result.access_token}`);
    console.log(`Refresh ${result.refresh_token}`);
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
    console.log(`Bearer ${result.access_token}`);
    console.log(`Refresh ${result.refresh_token}`);
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
    console.log(`AT : Bearer ${result.access_token}`);
    console.log(`RT : Bearer ${result.refresh_token}`);
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
    summary:
      "로그아웃 : 헤더(authorization)에 access_token을 담아서 보내주시면 됩니다",
  })
  @ApiBearerAuth("access_token")
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type: TokensResponse,
  })
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    try {
      const result = await this.authService.logout(userId);
      this.logger.log(
        `user_id : ${userId["user_email"]}님이 로그아웃 하셨습니다.`
      );
      return result;
    } catch (error) {
      this.logger.error("Logout error:", error);
      throw new ForbiddenException("Logout failed");
    }
  }
  /** -------------------- */

  /** 토큰 리프레시 */
  @UseGuards(RtGuard)
  @ApiOperation({
    summary:
      "리프레시 토큰 사용 및 교체: 헤더(authorization)에 리프레시토큰을 담아서 보내주시면 됩니다",
  })
  @ApiBearerAuth("refresh_token")
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: any,
    @GetCurrentUser("user_refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.authService.refreshTokens(
        userId["sub"],
        refreshToken
      );
      this.logger.log(`user_id : ${userId["user_email"]} 토큰 리프레시`);
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
  @UseGuards(ATGuard)
  @Post("revoke")
  async revokeAccount(@GetCurrentUserId() userId: any): Promise<any> {
    try {
      const result = await this.authService.revokeAccount(userId.sub);
      return result;
    } catch (error) {
      console.log("Controller revokeAccount", error);
    }
  }

  /** -------------------- */
}
