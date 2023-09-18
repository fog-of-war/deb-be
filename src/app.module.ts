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
import { APP_FILTER } from "@nestjs/core";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: UnauthorizedExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
