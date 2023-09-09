import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { LoggerModule } from "src/logger/logger.module";

@Module({
  providers: [EventsGateway],
  imports: [LoggerModule],
})
export class EventsModule {}
