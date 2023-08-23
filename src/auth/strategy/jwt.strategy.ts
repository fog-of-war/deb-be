import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService, private prisma: PrismaService) {
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
    console.log(
      "🚀 ~ file: jwt.strategy.ts:27 ~ JwtStrategy ~ validate ~ user:",
      user.user_nickname
    );
    return user;
  }
}
