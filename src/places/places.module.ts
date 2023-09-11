import { Module } from "@nestjs/common";
import { PlacesService } from "./places.service";
import { PlacesController } from "./places.controller";
import { LoggerModule } from "src/logger/logger.module";
import { CategoriesModule } from "src/categories/categories.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [LoggerModule, CategoriesModule, PrismaModule],
  providers: [PlacesService],
  controllers: [PlacesController],
  exports: [PlacesService],
})
export class PlacesModule {}
