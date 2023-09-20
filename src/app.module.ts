import {
  MiddlewareConsumer,
  Module,
  Scope,
  UnauthorizedException,
  ValidationPipe,
  Logger,
} from "@nestjs/common";
import { PlacesModule } from "./places/places.module";
import { UsersModule } from "./users/users.module";
import { BadgesModule } from "./badges/badges.module";
import { PostsModule } from "./posts/posts.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { CategoriesModule } from "./categories/categories.module";
import { PointsModule } from "./points/points.module";
import { LevelsModule } from "./levels/levels.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { RanksModule } from "./ranks/ranks.module";
import { LoggerModule } from "./logger/logger.module";
// import { AlertsModule } from "./alerts/alerts.module";
import { EventsModule } from "./events/events.module";
import { UnauthorizedExceptionFilter } from "./filters";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { CommentsModule } from "./comments/comments.module";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      socket: { host: "redis://redis", port: 6379 },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: UnauthorizedExceptionFilter,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
    AppService,
  ],
})
export class AppModule {}
