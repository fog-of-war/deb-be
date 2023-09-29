import { Module } from "@nestjs/common";
import { RanksService } from "./ranks.service";
import { RanksController } from "./ranks.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "src/users/users.module";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      store: redisStore,
      // socket: { host: "redis", port: 6379 },
      host: "redis",
      port: 6379,
    }),
  ],
  controllers: [RanksController],
  providers: [RanksService],
  exports: [RanksService],
})
export class RanksModule {}
