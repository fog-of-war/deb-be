import { Controller, ForbiddenException, Get, HttpCode, HttpStatus, InternalServerErrorException, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiProperty,
  ApiCreatedResponse,
  ApiTags,
  ApiOAuth2,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { GoogleAuthGuard, NaverAuthGuard } from "./guard";
import { Tokens } from "./types";
import { GetCurrentUser, GetUser } from "./decorator";
import { TokensResponse } from "./response";
import { LoggerService } from "src/logger/logger.service";

export class AuthRes {
  @ApiProperty()
  access_token: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService, private logger: LoggerService) {}

  @Get("google")
  @ApiOAuth2(["profile"])
  @ApiOperation({ summary: '구글 oauth' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Post("google/oauth")
  @ApiOperation({ summary: '구글 oauth 로그인 & 가입' })
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type:TokensResponse
  })
  @ApiCreatedResponse({ status: 403, description: "Forbidden." })
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ):Promise<Tokens> {
    const result = await this.authService.googleLogin(req);
    // 응답 헤더에 액세스 토큰을 추가
    console.log(`Bearer ${result.access_token}`);
    console.log(`REfresh ${result.refresh_token}`);
    res.header("Authorization", `Bearer ${result.access_token}`);
    return result
  }

  @Get("naver")
  @UseGuards(AuthGuard("naver"))
  // @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: '네이버 oauth' })
  async naverAuth(@Req() req) {}

  @Post("naver/oauth")
  @UseGuards(AuthGuard("naver"))
  // @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: '네이버 oauth 로그인 & 가입' })
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type:TokensResponse
  })
  @ApiCreatedResponse({ status: 403, description: "Forbidden.", type: AuthRes })
  async naverAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    console.log("hi")
    const result = await this.authService.naverLogin(req);
    // 응답 헤더에 액세스 토큰을 추가
    console.log(`Bearer ${result.access_token}`);
    console.log(`REfresh ${result.refresh_token}`);
    res.header("Authorization", `Bearer ${result.access_token}`);
    return result
  }

  @Get("kakao")
  @ApiOperation({ summary: '[승인전 사용불가]카카오 oauth' })
  @UseGuards(AuthGuard("kakao"))
  async kakaoAuth(@Req() req) {}

  @Post("kakao/oauth")
  @ApiOperation({ summary: '[승인전 사용불가]카카오 oauth 로그인 & 가입' })
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type:TokensResponse
  })
  @ApiCreatedResponse({ status: 403, description: "Forbidden.", type: AuthRes })
  @UseGuards(AuthGuard("kakao"))
  async kakaoAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.kakaoLogin(req);
    // 응답 헤더에 액세스 토큰을 추가
    console.log(`Bearer ${result.access_token}`);
    console.log(`REfresh ${result.refresh_token}`);
    res.header("Authorization", `Bearer ${result.access_token}`);
    return result
  }

  
  @UseGuards(AuthGuard('jwt-access'))
  @Post("logout")
  @ApiOperation({ summary: '로그아웃 : 헤더(authorization)에 access_token을 담아서 보내주시면 됩니다'})
  @ApiBearerAuth("access_token")
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type:TokensResponse
  })
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser("user_id") userId: number) {
    try {
      const result = await this.authService.logout(userId);
      this.logger.log(`user_id : ${userId}님이 로그아웃 하셨습니다.`)
      return result;
    } catch (error) {
      console.error("Logout error:", error);
      throw new ForbiddenException("Logout failed"); // 예외를 던집니다.
    }
  }
  
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: '리프레시 토큰 사용 및 교체: 헤더(authorization)에 리프레시토큰을 담아서 보내주시면 됩니다'})
  @ApiBearerAuth("refresh_token")
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUser("user") user: any,
    @GetCurrentUser("user_refresh_token") rt: any,
  ) {
    try {
      const result = await this.authService.refreshTokens(user.sub, rt.refreshToken);
      this.logger.log(`user_id : ${user.sub} 토큰 리프레시`)
      return result;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw new ForbiddenException('Access Denied');
    }
  }
}
