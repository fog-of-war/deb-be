import {
  Module,
  Scope,
  Logger,
} from "@nestjs/common";
import { PlacesModule } from "./places/places.module";
import { UsersModule } from "./users/users.module";
import { BadgesModule } from "./badges/badges.module";
import { PostsModule } from "./posts/posts.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CategoriesModule } from "./categories/categories.module";
import { PointsModule } from "./points/points.module";
import { LevelsModule } from "./levels/levels.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { RanksModule } from "./ranks/ranks.module";
import { LoggerModule } from "./logger/logger.module";
import { EventsModule } from "./events/events.module";
import { UnauthorizedExceptionFilter } from "./filters";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { CommentsModule } from "./comments/comments.module";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { AlertModule } from "./alert/alert.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     ttl: configService.get<number>('THROTTLE_TTL'), // 설정에서 가져옴
    //     limit: configService.get<number>('THROTTLE_LIMIT'), // 설정에서 가져옴
    //     storage: new ThrottlerStorageRedisService({
    //       host: configService.get('REDIS_HOST'), // Redis 호스트
    //       port: configService.get<number>('REDIS_PORT'), // Redis 포트
    //     }),
    //   }),
    // }),
    // 다른 모듈들을 여기에 추가
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
    PlacesModule,
    UsersModule,
    BadgesModule,
    PostsModule,
    AuthModule,
    PrismaModule,
    JwtModule,
    CategoriesModule,
    PointsModule,
    LevelsModule,
    EventEmitterModule.forRoot(),
    RanksModule,
    LoggerModule,
    EventsModule,
    ClientsModule.register([
      {
        name: "GREETING_SERVICE",
        transport: Transport.TCP,
        options: {
          host: "127.0.0.1",
          port: 5001,
        },
      },
    ]),
    CommentsModule,
    AlertModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: UnauthorizedExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
    AppService,
  ],
})
export class AppModule {}
//  Error: connect ECONNREFUSED 127.0.0.1:6379 at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1555:16)
