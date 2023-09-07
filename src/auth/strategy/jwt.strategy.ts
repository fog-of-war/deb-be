import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { RanksService } from "src/ranks/ranks.service";
import { Logger } from "pactum/src/exports/settings";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private ranksService: RanksService,
    private loggerService: LoggerService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //   ignoreExpiration: false,
      secretOrKey: config.get("AT_SECRET"),
    });
  }
  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: payload.sub,
      },
    });

    if (user) {
      this.loggerService.log(
        `user_id : ${user.user_id}, user_email : ${user.user_email}`
      );
    }
    return user;
  }
}
