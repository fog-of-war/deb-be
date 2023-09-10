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

  constructor(private logger: LoggerService) {}

  @SubscribeMessage("test")
  handleMessage(@MessageBody() data: string): Observable<WsResponse<number>> {
    this.logger.log("🐤웹소켓 test", data);

    const numbers = [1, 2, 3, 4, 5];

    // interval을 사용하여 3초 간격으로 데이터를 생성하고 delay로 간격 설정
    return from(numbers).pipe(
      delay(3000), // 3초 딜레이
      map((item) => ({ event: "events", data: item }))
    );
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
      `🐤웹소켓 연결 히히. 현재 네임스페이스: ${socket.nsp.name}`
    );
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
    socket.emit("Connect Hello", socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log("🐤웹소켓 연결해제 빠잉");
    socket.emit("Disconnect", socket.nsp.name);
    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit("onlineList", Object.values(onlineMap[socket.nsp.name]));
  }
}
