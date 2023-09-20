import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Type } from "@prisma/client";
import { EventsGateway } from "src/events/events.gateway";
@Injectable()
export class AlertService {
  constructor(
    private prisma: PrismaService,
    private readonly eventsGateway: EventsGateway
  ) {}

  async createNotifyAlert(id: number) {
    const data = { alert_place_id: id, alert_type: "NOTIFY" as Type };
    const result = await this.prisma.alert.create({ data: data });
    await this.eventsGateway.handleNotifyAlert(result);
    console.log(result);
  }

  async createActivityAlert(id: number) {
    const data = { alert_comment_id: id, alert_type: "ACTIVITY" as Type };
    const result = await this.prisma.alert.create({ data: data });
    await this.eventsGateway.handleActivityAlert(result);
    console.log(result);
  }
}
