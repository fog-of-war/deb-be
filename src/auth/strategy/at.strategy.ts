import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(config: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("AT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    console.log(
      "🚀 ~ file: at.strategy.ts:17 ~ AtStrategy ~ validate ~ payload:",
      payload
    );
    return payload;
  }
}
