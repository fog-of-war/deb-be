import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-naver-v2";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../../users/users.service";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, "naver") {
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
    private usersService: UsersService,
    private readonly httpService: HttpService
  ) {
    super({
      clientID: configService.get("NAVER_CLIENT_ID"),
      clientSecret: configService.get("NAVER_CLIENT_PW"),
      callbackURL: configService.get("NAVER_REDIRECT_URL"),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ): Promise<any> {
    // 사용자 프로필 정보 요청을 위한 옵션 설정
    const options = {
      url: "https://openapi.naver.com/v1/nid/me",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    // 요청 보내기
    const response = await this.httpService
      .get(options.url, {
        headers: options.headers,
      })
      .toPromise();
    const profileInfo = response.data.response;
    const { id, email } = profileInfo;
    let user = await this.usersService.findUserByEmail(email);

    if (!user) {
      const userDto = {
        user_providerId: id,
        user_email: email,
      };
      try {
        user = await this.usersService.createUser(userDto);
      } catch (error) {
        // 오류 발생 시 UnauthorizedException 던지기
        throw new UnauthorizedException("Failed to create user");
      }
    }

    done(null, user);
  }
}
