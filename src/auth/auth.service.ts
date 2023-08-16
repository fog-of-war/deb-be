import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async googleLogin(req: Request): Promise<any> {
    const user = req.user;
    return this.signToken(user["user_id"], user["user_nickname"]);
  }

  async kakaoLogin(req: Request): Promise<any> {
    const user = req.user;
    return this.signToken(user["user_id"], user["user_nickname"]);
  }

  async naverLogin(req: Request): Promise<any> {
    const user = req.user;
    return this.signToken(user["user_id"], user["user_nickname"]);
  }

  async signToken(
    userId: number,
    userNickname: string
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      userNickname,
    };
    const secret = this.config.get("JWT_SECRET");
    const token = await this.jwt.signAsync(payload, {
      expiresIn: "60m",
      secret: secret,
    });
    return { access_token: token };
  }
}
