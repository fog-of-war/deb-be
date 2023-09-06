import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Client } from "pg";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AlertsService implements OnModuleInit {
  private readonly client: Client;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.client = new Client({
      connectionString: this.config.get("DATABASE_URL"),
    });
  }

  async onModuleInit() {
    // await this.client.connect();
    // await this.client.query("LISTEN alert_insert");

    this.client.on("notification", async (msg) => {
      if (msg.channel === "my_channel") {
        console.log("Received notification:", msg.payload);
        // 데이터베이스 변경 이벤트 처리 로직을 여기에 추가
        return msg.payload;
      }
    });
  }
}
