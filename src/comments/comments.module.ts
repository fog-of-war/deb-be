import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { LoggerModule } from "src/logger/logger.module";
import { EventsGateway } from "src/events/events.gateway";

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CommentsController],
  providers: [CommentsService, EventsGateway],
})
export class CommentsModule {}
