import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Tokens } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async googleLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      console.error("Google login error:", error);
      throw new ForbiddenException("Google login failed");
    }
  }

  async kakaoLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      console.error("Kakao login error:", error);
      throw new ForbiddenException("Kakao login failed");
    }
  }

  async naverLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      console.error("Naver login error:", error);
      throw new ForbiddenException("Naver login failed");
    }
  }

  async signToken(userId: number, user_email: string): Promise<Tokens> {
    try {
      const payload = {
        sub: userId,
        user_email: user_email,
      };
      const at_secret = await this.config.get("AT_SECRET");
      const rt_secret = await this.config.get("RT_SECRET");
      const [at, rt] = await Promise.all([
        this.jwt.signAsync(payload, {
          expiresIn: "60m",
          secret: at_secret,
        }),
        this.jwt.signAsync(payload, {
          expiresIn: "7d",
          secret: rt_secret,
        }),
      ]);
      return { access_token: at, refresh_token: rt };
    } catch (error) {
      console.error("Sign token error:", error);
      throw new ForbiddenException("Token signing failed");
    }
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    try {
      const hash = await argon.hash(rt);
      await this.prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          user_refresh_token: hash,
        },
      });
    } catch (error) {
      console.error("Update refresh token hash error:", error);
      throw new ForbiddenException("Refresh token update failed");
    }
  }

  async logout(userId: number): Promise<any> {
    try {
      console.log(userId);
      await this.prisma.user.updateMany({
        where: {
          user_id: userId["sub"],
          user_refresh_token: {
            not: null,
          },
        },
        data: {
          user_refresh_token: null,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw new ForbiddenException("Logout failed");
    }
  }

  async refreshTokens(userId: number, rt: any): Promise<Tokens> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          user_id: userId,
        },
      });

      if (!user || !user.user_refresh_token) {
        throw new ForbiddenException("Access Denied");
      }

      const rtMatches = await argon.verify(user.user_refresh_token, rt);
      if (!rtMatches) {
        throw new ForbiddenException("Access Denied");
      }

      const tokens = await this.signToken(user.user_id, user.user_email);
      await this.updateRtHash(user.user_id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      console.error("Refresh tokens error:", error);
      throw new ForbiddenException("Token refresh failed");
    }
  }
}
