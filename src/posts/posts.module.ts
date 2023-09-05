import { Module } from "@nestjs/common";
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

@Module({
  imports: [PrismaModule, RanksModule ,PlacesModule,BadgesModule, PointsModule,LevelsModule, UsersModule,LoggerModule],
  controllers: [PostsController],
  providers: [
    PostsService
  ],
})
export class PostsModule {}
