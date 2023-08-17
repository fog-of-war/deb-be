import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";
import { UsersService } from "../../users/users.service";
import { PrismaService } from "../../prisma/prisma.service";
@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
    private usersService: UsersService
  ) {
    super({
      clientID: config.get("KAKAO_CLIENT_ID"),
      clientSecret: "",
      callbackURL: config.get("KAKAO_REDIRECT_URL"),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) {
    try {
      const { _json } = profile;
      const userDto = {
        user_providerId: "kakao",
        user_email: _json.kakao_account.email,
      };
      const user = await this.usersService.createUser(userDto);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
