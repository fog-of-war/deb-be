import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { LoggerModule } from "src/logger/logger.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PlacesModule } from "src/places/places.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  providers: [EventsGateway],
  imports: [
    PrismaModule,
    PlacesModule,
    LoggerModule,
    ClientsModule.register([
      {
        name: "ALERT", // 마이크로서비스의 이름
        transport: Transport.TCP, // 원하는 트랜스포트 설정
        options: {
          host: "localhost", // 마이크로서비스 호스트
          port: 5001, // 마이크로서비스 포트
        },
      },
    ]),
  ],
})
export class EventsModule {}
