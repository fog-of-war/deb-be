import { Module } from "@nestjs/common";
import { RanksService } from "./ranks.service";
import { RanksController } from "./ranks.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "src/users/users.module";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "src/logger/logger.module";
@Module({
  imports: [
    LoggerModule,
    PrismaModule,
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
  controllers: [RanksController],
  providers: [RanksService],
  exports: [RanksService],
})
export class RanksModule {}
