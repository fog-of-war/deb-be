import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { LoggerModule } from "src/logger/logger.module";
import { EventsGateway } from "src/events/events.gateway";
import { AuthModule } from "src/auth/auth.module";
import { EventsModule } from "src/events/events.module";
import { AlertModule } from "src/alert/alert.module";

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule, AlertModule], // EventsModule 추가
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
