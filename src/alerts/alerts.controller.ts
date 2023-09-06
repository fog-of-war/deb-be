import { Controller, Get } from "@nestjs/common";
import { AlertsService } from "./alerts.service";
import { GetCurrentUser } from "src/auth/decorator";

@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async getAlerts(@GetCurrentUser("user_id") userId: string) {
    const result = this.alertsService.getAlerts(userId);
    return result;
  }
}
