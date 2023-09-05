import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";
import { PrismaService } from "../../prisma/prisma.service";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
    private usersService: UsersService,
    private httpService: HttpService // httpService 주입
  ) {
    super({
      clientID: config.get("KAKAO_JAVASCRIPT_KEY"),
      clientSecret: "",
      callbackURL: config.get("KAKAO_REDIRECT_URL"),
      scope: ["account_email"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile, done) {
    console.log(accessToken);
    const payload = {
      name: profile._json.kakao_account.profile.nickname,
      kakaoid: profile._json.id,
    };
    done(null, payload);
  }

  // async validate(
  //   req: any, // ExecutionContext에서 req 추출
  //   accessToken: string,
  //   refreshToken: string,
  //   profile: Profile,
  //   done: (error: any, user?: any, info?: any) => void
  // ) {
  //   try {
  //     console.log(
  //       "🚀 ~ file: kakao.strategy.ts:32 ~ KakaoStrategy ~ classKakaoStrategyextendsPassportStrategy ~ req:",
  //       accessToken,
  //       refreshToken,
  //       profile
  //     );
  //     const options = {
  //       url: `/v2/user/me`,
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         params: {
  //           client_id: this.config.get("KAKAO_CLIENT_ID"),
  //           redirect_uri: this.config.get("KAKAO_REDIRECT_URL"),
  //           response_type: "code",
  //           scope: "account_email",
  //         },
  //       },
  //     };
  //     // 요청 보내기
  //     const response = await this.httpService
  //       .get(options.url, {
  //         // headers: options.headers,
  //       })
  //       .toPromise();
  //     const profileInfo = response.data.response;
  //     const { _json } = profileInfo;
  //     const userDto = {
  //       user_providerId: "kakao",
  //       user_email: _json.kakao_account.email,
  //     };
  //     const user = await this.usersService.createUser(userDto);
  //     done(null, user);
  //   } catch (error) {
  //     done(error);
  //   }
  // }
}
