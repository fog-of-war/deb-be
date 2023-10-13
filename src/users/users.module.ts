import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtStrategy } from "../auth/strategy";
import { PrismaModule } from "../prisma/prisma.module";

import { BadgesModule } from "src/badges/badges.module";
import { RanksModule } from "src/ranks/ranks.module";
import { LoggerModule } from "src/logger/logger.module";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { ConfigModule, ConfigService } from "@nestjs/config";
@Module({
  imports: [
    PrismaModule,
    BadgesModule,
    RanksModule,
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const environment = configService.get<string>("ENVIRONMENT");
        const redisConfig =
          environment === "production"
            ? {
                store: redisStore,
                host: "redis",
                port: 6379,
              }
            : {
                store: redisStore,
                socket: { host: "redis", port: 6379 },
              };
        return {
          ...redisConfig,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
