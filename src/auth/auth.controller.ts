import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiProperty,
  ApiCreatedResponse,
  ApiTags,
  ApiOAuth2,
  ApiOperation,
} from "@nestjs/swagger";
import { Response } from "express";
import { GoogleAuthGuard, LoginGuard } from "./guard/auth.guard";

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
  ) {
    const token = await this.authService.googleLogin(req);
    // 응답 헤더에 액세스 토큰을 추가
    console.log(`Bearer ${token}`);
    res.header("Authorization", `Bearer ${token}`);
    res.status(201).send({ access_token: token });
  }

  @Get("naver")
  @UseGuards(AuthGuard("naver"))
  @ApiOperation({ summary: '네이버 oauth' })
  async naverAuth(@Req() req) {}

  @Post("naver/oauth")
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
}
