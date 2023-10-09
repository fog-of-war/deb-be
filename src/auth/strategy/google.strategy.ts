import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";
import { access } from "fs";
import * as argon from "argon2";
import { AuthService } from "../auth.service";

/** 구글 oauth 를 사용한 인증 전략 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    config: ConfigService,
    private usersService: UsersService,
    private authService: AuthService
  ) {
    super({
      clientID: config.get("GOOGLE_OAUTH_ID"),
      clientSecret: config.get("GOOGLE_OAUTH_SECRET"),
      callbackURL: config.get("GOOGLE_REDIRECT_URL"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, emails } = profile;
    const email = emails[0].value;

    let user = await this.usersService.findUserByEmail(email);

    if (!user) {
      const userDto = {
        user_providerId: id,
        user_email: email,
        user_oauth_token: accessToken,
      };
      try {
        user = await this.usersService.createUser(userDto);
      } catch (error) {
        // 오류 발생 시 UnauthorizedException 던지기
        throw new UnauthorizedException("Failed to create user");
      }
    }
    if (user) {
      await this.authService.updateOauthToken(user.user_id, accessToken);
    }
    done(null, user);
  }
}
