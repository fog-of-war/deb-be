import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../../users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private usersService: UsersService
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
    const { id, emails, photos } = profile;
    console.log(
      "🚀 ~ file: google.strategy.ts:30 ~ GoogleStrategy ~ classGoogleStrategyextendsPassportStrategy ~ id, emails, photos:",
      id,
      emails,
      photos
    );

    const email = emails[0].value;

    let user = await this.usersService.findUserByEmail(email);

    if (!user) {
      const userDto = {
        user_providerId: id,
        user_email: email,
        user_image_url: photos[0].value,
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
