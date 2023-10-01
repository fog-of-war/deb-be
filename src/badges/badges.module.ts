import { Module } from "@nestjs/common";
import { BadgesService } from "./badges.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { LoggerModule } from "src/logger/logger.module";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
@Module({
  imports: [
    LoggerModule,
    CacheModule.register({
      store: redisStore,
      //       socket: { host: "redis", port: 6379 },
      host: "redis",
      port: 6379,
    }),
  ],
  providers: [BadgesService, PrismaModule],
  exports: [BadgesService],
})
export class BadgesModule {}
