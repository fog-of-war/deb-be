import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { LoggerModule } from "src/logger/logger.module";
import { EventsGateway } from "src/events/events.gateway";
import { AlertModule } from "src/alert/alert.module";

@Module({
  imports: [PrismaModule, LoggerModule, AlertModule],
  controllers: [CommentsController],
  providers: [CommentsService, EventsGateway],
})
export class CommentsModule {}
