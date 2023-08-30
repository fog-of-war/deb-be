import { Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Post, Req, Res, UseGuards } from "@nestjs/common";
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
import { GoogleAuthGuard, NaverAuthGuard } from "./guard/auth.guard";
import { Tokens } from "./types";
import { GetCurrentUser, GetUser } from "./decorator";

export class AuthRes {
  @ApiProperty()
  access_token: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    type: AuthRes,
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
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: '네이버 oauth' })
  async naverAuth(@Req() req) {}

  @Post("naver/oauth")
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: '네이버 oauth 로그인 & 가입' })
  @ApiCreatedResponse({
    status: 201,
    description: "success",
  })
  @ApiCreatedResponse({ status: 403, description: "Forbidden.", type: AuthRes })
  @UseGuards(AuthGuard("naver"))
  async naverAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = await this.authService.naverLogin(req);
    res.header("Authorization", `Bearer ${token}`);
    res.status(201).send({ access_token: token });
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
  })
  @ApiCreatedResponse({ status: 403, description: "Forbidden.", type: AuthRes })
  @UseGuards(AuthGuard("kakao"))
  async kakaoAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = await this.authService.naverLogin(req);
    // 쿠키를 설정한 후 응답을 보내기
    res.header("Authorization", `Bearer ${token}`);
    res.status(201).send({ access_token: token }); // 필요에 따라 응답 본문에도 추가
  }

  
  @UseGuards(AuthGuard('jwt-access'))
  @Post("logout")
  @ApiOperation({ summary: '로그아웃'})
  @ApiBearerAuth("access_token")
  @ApiCreatedResponse({
    status: 201,
    description: "success",
  })
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser("user_id") userId: number) {
    try {
      const result = await this.authService.logout(userId);
      return result;
    } catch (error) {
      // 예외 처리 로직을 추가합니다.
      // 예를 들어, 클라이언트에게 오류 응답을 반환하거나 로깅할 수 있습니다.
      console.error("Logout error:", error);
      throw new InternalServerErrorException("Logout failed"); // 예외를 던집니다.
    }
  }
  
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: '리프레시토큰'})
  @ApiBearerAuth("refresh_token")
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetUser("user") user: any,
    @GetCurrentUser("user_refresh_token") rt: any,
  ) {
    try {
      console.log("🚀 ~ file: auth.controller.ts:126 ~ AuthController ~ user:", user)
      console.log("🚀 ~ file: auth.controller.ts:126 ~ AuthController ~ user:", user.sub)
      const result = await this.authService.refreshTokens(user.sub, rt.refreshToken);
      return result;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw new InternalServerErrorException("Token refresh failed");
    }
  }
  
}
