import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtPayload, JwtPayloadWithRt } from "../types";
import { LoggerService } from "src/logger/logger.service";

/** Refresh Token 인증 전략 */
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    config: ConfigService,
    private readonly loggerService: LoggerService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("RT_SECRET"),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    try {
      const refreshToken = req
        ?.get("authorization")
        ?.replace("Bearer", "")
        .trim();

      if (!refreshToken) {
        this.loggerService.error("Refresh token malformed");
        throw new ForbiddenException("Refresh token malformed");
      }

      this.loggerService.log("Refresh token refreshToken:", refreshToken);
      this.loggerService.log("Refresh token payload:", payload);

      return {
        ...payload,
        refreshToken,
      };
    } catch (error) {
      // 예외 처리 로직을 추가합니다.
      this.loggerService.error("Refresh token validation error:", error);
      throw new ForbiddenException("Refresh token validation failed");
    }
  }
}
