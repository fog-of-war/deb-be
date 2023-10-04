import { Module } from "@nestjs/common";
import { AlertService } from "./alert.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { EventsModule } from "src/events/events.module";
import { LoggerModule } from "src/logger/logger.module";

@Module({
  imports: [PrismaModule, EventsModule, LoggerModule],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
