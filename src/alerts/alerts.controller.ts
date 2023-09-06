import { Controller, Get, Sse } from "@nestjs/common";
import { AlertsService } from "./alerts.service";
import { GetCurrentUser } from "src/auth/decorator";
// import { Observable } from "rxjs";
// import { MessageEvent } from "./dto";
// import { Response } from "express";
@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Sse()
  async getAlerts(@GetCurrentUser("user_id") userId: string): Promise<any> {
    const result = await this.alertsService.onModuleInit();
    console.log(result);
    return result;
    // const eventSource = new EventSource("/sse");
    // eventSource.onmessage = ({ data }) => {
    //   console.log("New message", JSON.parse(data));
    // };
  }
}
