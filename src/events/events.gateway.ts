import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets";
import { from, Observable } from "rxjs";
import { map, delay } from "rxjs/operators";
import { LoggerService } from "src/logger/logger.service";
import { Server, Socket } from "socket.io";
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
} from "@nestjs/microservices";
import { Inject } from "@nestjs/common";

//ws://localhost:5000/v1/ws-alert postman 으로 성공

export const onlineMap = {};

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: /\/ws-.+/, // "options" 대신 "namespace"를 사용
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  constructor(
    @Inject("ALERT") private readonly alertClient: ClientProxy,
    private logger: LoggerService
  ) {}

  @SubscribeMessage("send_message")
  handleEvent(
    @MessageBody() data: string
  ): Observable<WsResponse<number>> | any {
    this.logger.log("🐤웹소켓 send_message 라우터 호출됨", data);
    this.server.emit("receive_message", { message: data }); // 모든 클라이언트에게 메시지 전송
  }

  @SubscribeMessage("send_alert")
  handleAlertEvent(
    @MessageBody() data: string
  ): Observable<WsResponse<number>> | any {
    console.log("Received alert event:", data);

    // this.logger.log("🐤웹소켓 send_alert 라우터 호출됨", "안녕");
    this.server.emit("receive_alert", { message: data });
  }

  @SubscribeMessage("error")
  handleErrorMessage(@MessageBody() error: string): void {
    console.error("🥺WebSocket 오류:", error);
    this.server.emit("🥺error", error);
  }

  afterInit(server: Server): any {
    this.logger.log("🐤웹소켓 초기화 안녕");
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(
      `🐤웹소켓 연결 현재 네임스페이스: ${socket.nsp.name}, ${socket.id}`
    );
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log("🐤웹소켓 연결해제 빠잉");
    // socket.emit("Disconnect", socket.nsp.name);
    // socket.emit("Disconnect", "🐤웹소켓 연결해제 빠잉");
    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit("onlineList", Object.values(onlineMap[socket.nsp.name]));
  }
}
// const numbers = [1, 2, 3, 4, 5];
// return from(numbers).pipe(map((item) => ({ event: "events", data: item })));

// const numbers = [1, 2, 3, 4, 5];
// return from(numbers).pipe(
//   map((item) => ({ event: "receive_alert", message: "hi" }))
// );
// 모든 클라이언트에게 메시지 전송
