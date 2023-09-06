import { Module } from "@nestjs/common";
import { AlertsService } from "./alerts.service";
import { AlertsController } from "./alerts.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
