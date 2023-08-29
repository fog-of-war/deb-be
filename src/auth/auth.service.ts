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
    const result =  await  this.signToken(user["user_id"], user["user_nickname"]);
    return result;
  }

  async signToken(userId: number, userNickname: string): Promise<string> {
    const payload = {
      sub: userId
    };
    const secret = await this.config.get("JWT_SECRET");
    const token = await this.jwt.signAsync(payload, {
      expiresIn: "180m",
      secret: secret,
    });
    return token;
  }
}
