import { Module } from "@nestjs/common";
import { PlacesService } from "./places.service";
import { PlacesController } from "./places.controller";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  providers: [PlacesService, PrismaService],
  controllers: [PlacesController],
  exports:[PlacesService]
})
export class PlacesModule {}
