import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Tokens } from "./types";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService
  ) {}
  /** 구글 oauth 로그인 */
  async googleLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Google login error:", error);
      throw new ForbiddenException("Google login failed");
    }
  }
  /** -------------------- */

  /** 카카오 oauth 로그인 */
  async kakaoLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Kakao login error:", error);
      throw new ForbiddenException("Kakao login failed");
    }
  }
  /** -------------------- */

  /** 네이버 oauth 로그인 */
  async naverLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Naver login error:", error);
      throw new ForbiddenException("Naver login failed");
    }
  }
  /** -------------------- */

  /** 토큰에 사인 */
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
          expiresIn: "30s",
          secret: at_secret,
        }),
        this.jwt.signAsync(payload, {
          expiresIn: "7d",
          secret: rt_secret,
        }),
      ]);
      return { access_token: at, refresh_token: rt };
    } catch (error) {
      this.logger.error("Sign token error:", error);
      throw new ForbiddenException("Token signing failed");
    }
  }

  /** 로그아웃 */
  async logout(userId: number): Promise<any> {
    try {
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
      this.logger.error("Logout error:", error);
      throw new ForbiddenException("Logout failed");
    }
  }
  /** -------------------- */

  /** 리프레시 토큰을 사용하여 엑세스토큰 재발급 */
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
      // this.logger.log("refreshTokens", user.user_refresh_token);
      // this.logger.log("refreshTokens", rt.refreshToken);
      const rtMatches = await argon.verify(
        user.user_refresh_token,
        rt.refreshToken
      );

      if (!rtMatches) {
        this.logger.log("rtMatches", "Access Denied");
        throw new ForbiddenException("Access Denied");
      }

      const tokens = await this.signToken(user.user_id, user.user_email);
      await this.updateRtHash(user.user_id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Refresh tokens error:", error);
      throw new ForbiddenException("Token refresh failed");
    }
  }
  /** -------------------- */

  /** 리프레시 토큰을 데이터베이스에 업데이트 */
  async updateRtHash(userId: number, rt: string): Promise<void> {
    try {
      console.log("updateRtHash", rt);
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
      this.logger.error("Update refresh token hash error:", error);
      throw new ForbiddenException("Refresh token update failed");
    }
  }
  /** -------------------- */
}
