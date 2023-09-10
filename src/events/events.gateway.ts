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
import { map } from "rxjs/operators";
import { LoggerService } from "src/logger/logger.service";
import { Server, Socket } from "socket.io";

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
    const numbers = [1, 2, 3, 4, 5];
    this.server.emit("🥺data", data);
    this.logger.log("🐤웹소켓 test");
    return from(numbers).pipe(map((item) => ({ event: "events", data: item })));
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

// @SubscribeMessage("events")
// findAll(
//   @MessageBody() data: any
//   // @ConnectedSocket() client: WebSocket
// ): Observable<WsResponse<number>> | any {
//   console.log("🐤");
//   //  return "HelloWorld"
//   const numbers = [1, 2, 3, 4, 5];
//   return from(numbers).pipe(map((item) => ({ event: "events", data: item })));
// }

// // 에러 처리를 위한 이벤트 핸들러 추가
// @SubscribeMessage("error")
// handleErrorMessage(@MessageBody() error: string): void {
//   console.error("🥺WebSocket 오류:", error);

//   // 클라이언트에 에러 메시지 전송
//   this.server.emit("🥺error", error);
// }

// @SubscribeMessage("identity")
// async identity(@MessageBody() data: number): Promise<number> {
//   return data;
// }

// // @SubscribeMessage("events")
// // handleEvent(client: Client, data: string): string {
// //   return data;
// // }
