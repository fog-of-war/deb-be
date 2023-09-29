import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";
import { UsersService } from "src/users/users.service";

/** Access Token 인증 전략 */
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(config: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("AT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
