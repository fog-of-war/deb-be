import { Module } from "@nestjs/common";
import { BadgesController } from "./badges.controller";
import { BadgesService } from "./badges.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { LoggerModule } from "src/logger/logger.module";

@Module({
  imports:[LoggerModule],
  controllers: [BadgesController],
  providers: [BadgesService, PrismaModule],
  exports: [BadgesService],
})
export class BadgesModule {}
