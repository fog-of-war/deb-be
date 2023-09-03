import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";
import { UsersService } from "../../users/users.service";
import { PrismaService } from "../../prisma/prisma.service";
@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  httpService: any;
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
    private usersService: UsersService
  ) {
    super({
      clientID: config.get("KAKAO_CLIENT_ID"),
      clientSecret: "",
      callbackURL: config.get("KAKAO_REDIRECT_URL"),
      scope: ["account_email", "profile_nickname"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) {
    // const { id, email } = profileInfo;

    try {
      console.log(
        "🚀 ~ file: kakao.strategy.ts:37 ~ KakaoStrategy ~ classKakaoStrategyextendsPassportStrategy ~ accessToken:",
        accessToken
      );

      const options = {
        url: `https://kauth.kakao.com/oauth/authorize`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          params: {
            client_id: this.config.get("KAKAO_CLIENT_ID"),
            redirect_uri: this.config.get("KAKAO_REDIRECT_URL"),
            response_type: "code",
            scope: "account_email",
          },
        },
      };
      // 요청 보내기
      const response = await this.httpService
        .get(options.url, {
          headers: options.headers,
        })
        .toPromise();
      const profileInfo = response.data.response;
      console.log(
        "🚀 ~ file: kakao.strategy.ts:51 ~ KakaoStrategy ~ classKakaoStrategyextendsPassportStrategy ~ response:",
        response
      );
      console.log(
        "🚀 ~ file: kakao.strategy.ts:48 ~ KakaoStrategy ~ classKakaoStrategyextendsPassportStrategy ~ profileInfo:",
        profileInfo
      );
      const { _json } = profileInfo;
      console.log(
        "🚀 ~ file: kakao.strategy.ts:65 ~ KakaoStrategy ~ classKakaoStrategyextendsPassportStrategy ~ profileInfo:",
        profileInfo
      );
      const userDto = {
        user_providerId: "kakao",
        user_email: _json.kakao_account.email,
      };
      const user = await this.usersService.createUser(userDto);
      console.log(
        "🚀 ~ file: kakao.strategy.ts:34 ~ KakaoStrategy ~ classKakaoStrategyextendsPassportStrategy ~ user:",
        user
      );
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
