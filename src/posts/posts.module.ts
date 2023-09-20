import { Module, Scope } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PlacesModule } from "src/places/places.module";
import { BadgesModule } from "src/badges/badges.module";
import { PointsModule } from "src/points/points.module";
import { LevelsModule } from "src/levels/levels.module";
import { UsersModule } from "src/users/users.module";
import { RanksModule } from "src/ranks/ranks.module";
import { LoggerModule } from "src/logger/logger.module";
import { APP_FILTER } from "@nestjs/core";
import { UnauthorizedExceptionFilter } from "../filters";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EventsModule } from "src/events/events.module";
import { EventsGateway } from "src/events/events.gateway";
import { AlertModule } from "src/alert/alert.module";
@Module({
  imports: [
    PrismaModule,
    RanksModule,
    PlacesModule,
    BadgesModule,
    PointsModule,
    LevelsModule,
    UsersModule,
    LoggerModule,
    AlertModule,
    // EventsModule,
    // ClientsModule.register([
    //   {
    //     name: "GREETING_SERVICE",
    //     transport: Transport.TCP,
    //     options: {
    //       host: "127.0.0.1",
    //       port: 5001,
    //     },
    //   },
    // ]),
    EventsModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: UnauthorizedExceptionFilter,
    },
    EventsGateway,
  ],
})
export class PostsModule {}
