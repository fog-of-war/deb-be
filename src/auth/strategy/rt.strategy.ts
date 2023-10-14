import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtPayload, JwtPayloadWithRt } from "../types";
import { LoggerService } from "src/logger/logger.service";
import { Request as RequestType } from "express";

/** Refresh Token 인증 전략 */
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    config: ConfigService,
    private readonly loggerService: LoggerService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("RT_SECRET"),
      passReqToCallback: true,
    });
  }
  private static extractJWT(req: RequestType): string | null {
    if (
      req.cookies &&
      "refresh_token" in req.cookies &&
      req.cookies.refresh_token.length > 0
    ) {
      // console.log("extractJWT RT \n", req.cookies.refresh_token);
      return req.cookies.refresh_token;
    }
    return null;
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    try {
      // const refreshToken = req
      //   ?.get("authorization")
      //   ?.replace("Bearer", "")
      //   .trim();
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        this.loggerService.error("Refresh token malformed");
        throw new ForbiddenException("Refresh token malformed");
      }
      return {
        ...payload,
        refreshToken,
      };
    } catch (error) {
      // 예외 처리 로직을 추가합니다.
      // this.loggerService.error("Refresh token validation error:", error);
      throw new ForbiddenException("Refresh token validation failed");
    }
  }
}
