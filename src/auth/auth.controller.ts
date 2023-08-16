import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiProperty, ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

export class AuthRes {
  @ApiProperty()
  access_token: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req) {}

  @Get("google/redirect")
  @ApiCreatedResponse({
    status: 201,
    description: "success",
    type: AuthRes,
  })
  @ApiCreatedResponse({ status: 403, description: "Forbidden." })
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = await this.authService.googleLogin(req);
    // 쿠키를 설정한 후 응답을 보내기
    res.cookie("access_token", token, { domain: "fog-of-war-gray.vercel.app" });
    // 리다이렉트 수행
    res.redirect("https://fog-of-war-gray.vercel.app/");
  }

  @Get("naver")
  @UseGuards(AuthGuard("naver"))
  async naverAuth(@Req() req) {}

  @Get("naver/redirect")
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

    // 쿠키를 설정한 후 응답을 보내기
    res.cookie("access_token", token, { domain: "fog-of-war-gray.vercel.app" });
    // 리다이렉트 수행
    res.redirect("https://fog-of-war-gray.vercel.app/");
  }

  @Get("kakao")
  @UseGuards(AuthGuard("kakao"))
  async kakaoAuth(@Req() req) {}

  @Get("kakao/redirect")
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
    res.cookie("access_token", token, { domain: "fog-of-war-gray.vercel.app" });
    // 리다이렉트 수행
    res.redirect("https://fog-of-war-gray.vercel.app/");
  }
}
