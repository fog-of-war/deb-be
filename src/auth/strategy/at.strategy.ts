import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";
import { UsersService } from "src/users/users.service";

import { Request as RequestType } from "express";

/** Access Token 인증 전략 */
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(config: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        AtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("AT_SECRET"),
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (
      req.cookies &&
      "access_token" in req.cookies &&
      req.cookies.access_token.length > 0
    ) {
      // console.log("extractJWT AT \n", req.cookies.access_token);
      return req.cookies.access_token;
    }
    return null;
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
