import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAlerts(userId) {
    const result = await this.prisma.user.findFirst({
      where: { user_id: userId },
    });
    return result;
  }
}
