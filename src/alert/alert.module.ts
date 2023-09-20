import { Module } from "@nestjs/common";
import { AlertService } from "./alert.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { EventsModule } from "src/events/events.module";

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
