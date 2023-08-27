import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { RanksService } from "src/ranks/ranks.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService, private prisma: PrismaService,  private ranksService: RanksService,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //   ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECRET"),
    });
  }
  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: payload.sub,
      },
      include: {
        user_badges: true,
        user_visited_places: true,
        user_authored_posts: true,
      },
    });

        // 랭킹 업데이트 로직 호출
   const rank  = await this.ranksService.getUserRank(user.user_id);

    console.log(
      "🚀 ~ file: jwt.strategy.ts:27 ~ JwtStrategy ~ validate ~ user_nickname:",
      user.user_nickname,
      "🚀 ~ file: jwt.strategy.ts:27 ~ JwtStrategy ~ validate ~ user_email:",
      user.user_email
    );
    return user;
  }
}
