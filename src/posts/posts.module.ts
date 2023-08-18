import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PlacesService } from "src/places/places.service";

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [PostsService, PlacesService],
})
export class PostsModule {}
