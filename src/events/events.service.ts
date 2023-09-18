import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}
  async sendRegionAlerts(placeId: number): Promise<void> {
    const place = await this.prisma.place.findFirst({
      where: { place_id: placeId },
    });
    console.log(place);
  }
}
