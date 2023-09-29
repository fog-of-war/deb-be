import { Logger, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import {
  GoogleStrategy,
  KakaoStrategy,
  NaverStrategy,
  AtStrategy,
  RtStrategy,
  WsStrategy,
} from "./strategy";
import { UsersModule } from "src/users/users.module";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { RanksModule } from "src/ranks/ranks.module";
import { LoggerModule } from "src/logger/logger.module";

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    JwtModule.register({}),
    PassportModule.register({
      passReqToCallback: true, // 이 옵션을 추가하여 Request 객체를 Strategy로 전달
      session: false,
    }),
    UsersModule,
    RanksModule,
    LoggerModule,
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy,
    AtStrategy,
    RtStrategy,
    WsStrategy,
  ],
  controllers: [AuthController],
  exports: [AtStrategy, WsStrategy],
})
export class AuthModule {}
