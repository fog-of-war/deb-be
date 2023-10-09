import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Tokens } from "./types";
import { LoggerService } from "src/logger/logger.service";
import { HttpService } from "@nestjs/axios";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly httpService: HttpService
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
      this.logger.error("Sign token error:", error);
      throw new ForbiddenException("Token signing failed");
    }
  }
  /** -------------------- */

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

  /** 회원 탈퇴 */
  async revokeAccount(userId) {
    try {
      // 사용자 정보 가져오기
      const user = await this.prisma.user.findFirst({
        where: {
          user_id: userId,
        },
        select: { user_oauth_token: true, user_oauth_provider: true },
      });

      // 토큰이 없으면 종료
      if (!user || !user.user_oauth_token) {
        throw new NotFoundException("사용자 토큰을 찾을 수 없습니다.");
      }
      console.log("Service revokeAccount", user.user_oauth_token);

      const oauthToken = user.user_oauth_token;
      console.log("revokeAccount", oauthToken);
      switch (user.user_oauth_provider) {
        case "google":
          await this.revokeGoogleAccount(oauthToken);
          break;
        case "naver":
          await this.revokeNaverAccount(oauthToken);
          break;
        default:
          throw new Error("지원되지 않는 OAuth 공급자입니다.");
      }
      // 유저 삭제여부 업데이트
      await this.changeUserStateDelete(userId);
      return "탈퇴 성공";
    } catch (error) {
      throw error;
    }
  }

  /** -------------------- */
  async changeUserStateDelete(userId) {
    await this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        user_is_deleted: true,
        user_oauth_token: null,
      },
    });
  }
  /** -------------------- */

  /** 구글 oauth 해제 */
  // https://developers.google.com/identity/protocols/oauth2/web-server?hl=ko#tokenrevoke
  async revokeGoogleAccount(oauthToken) {
    try {
      const postData = `token=${oauthToken}`;
      console.log("revokeGoogleAccount", postData);
      const postOptions = {
        url: "https://oauth2.googleapis.com/revoke",
        method: "POST",
        port: "443",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
        data: postData,
      };
      const httpService = new HttpService();
      const response = await httpService
        .post(postOptions.url, postData, {
          headers: postOptions.headers,
        })
        .toPromise();
      return response.status;
    } catch (error) {
      this.logger.error("revokeGoogleAccount 에러:", error);
      throw error;
    }
  }
  /** -------------------- */

  /** 네이버 oauth 해제 */
  // https://developers.naver.com/docs/login/devguide/devguide.md#5-3-%EB%84%A4%EC%9D%B4%EB%B2%84-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%97%B0%EB%8F%99-%ED%95%B4%EC%A0%9C
  async revokeNaverAccount(oauthToken) {
    try {
      const naverClientID = await this.config.get("NAVER_CLIENT_ID");
      const naverClientSecret = await this.config.get("NAVER_CLIENT_PW");
      const postData = `grant_type=delete&client_id=${naverClientID}&client_secret=${naverClientSecret}&access_token=${oauthToken}`;
      const postOptions = {
        url: "https://nid.naver.com/oauth2.0/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: postData,
      };
      const httpService = new HttpService();
      const response = await httpService
        .post(postOptions.url, postData, {
          headers: postOptions.headers,
        })
        .toPromise();
      return response.status;
    } catch (error) {
      this.logger.error("revokeNaverAccount 에러:", error);
      // 에러가 발생한 경우 적절한 오류 메시지 또는 상태 코드를 반환하거나 예외를 다시 던질 수 있습니다.
      throw new Error("Naver 계정 탈퇴 실패");
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

  /** Oauth 토큰 암호화 */
  // async hashingOauthToken(oauthAccessToken: string): Promise<string> {
  //   try {
  //     return await argon.hash(oauthAccessToken);
  //   } catch (error) {
  //     this.logger.error("hashing oauth token hash error:", error);
  //     throw new ForbiddenException("hashing token update failed");
  //   }
  // }
  /** -------------------- */

  /** Oauth 토큰 업데이트 */
  async updateOauthToken(userId: number, OauthToken: string): Promise<void> {
    try {
      console.log("updateOauthTokenHash", OauthToken);
      await this.prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          user_oauth_token: OauthToken,
        },
      });
    } catch (error) {
      this.logger.error("Update oauth token hash error:", error);
      throw new ForbiddenException("oauth token update failed");
    }
  }
  /** -------------------- */
}
