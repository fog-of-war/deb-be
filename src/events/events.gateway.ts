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
import { Server, Socket } from "socket.io"; // Socket 타입 import

export const onlineMap = {};
@WebSocketGateway({
  cors: {
    origin: "*",
  },
  options: { namespace: /\/ws-.+/ },
})
//implements 를 붙이면 타입스크립트로 지정해둔 메서드를 무조건 만들어줘야하기때문에 검사용으로 굿
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  constructor(private logger: LoggerService) {}
  // 메시지 처리를 위한 이벤트 핸들러 추가
  @SubscribeMessage("test")
  handleMessage(@MessageBody() data: string): void {
    console.error("🥺WebSocket 메시지:", data);
    this.server.emit("🥺data", data);
  }

  // 에러 처리를 위한 이벤트 핸들러 추가
  @SubscribeMessage("error")
  handleErrorMessage(@MessageBody() error: string): void {
    console.error("🥺WebSocket 오류:", error);
    // 클라이언트에 에러 메시지 전송
    this.server.emit("🥺error", error);
  }

  // OnGatewayInit 인터페이스의 메서드 구현
  afterInit(server: Server) {
    // WebSocket 게이트웨이 초기화 시 처리할 로직을 구현합니다.
    this.logger.log("🐤웹소켓 초기화 안뇽");
  }

  // OnGatewayConnection 인터페이스의 메서드 구현
  handleConnection(
    @ConnectedSocket() socket: Socket
    // client: any,
    // ...args: any[]
  ) {
    // 클라이언트 연결 시 처리할 로직을 구현합니다.
    this.logger.log("🐤웹소켓 연결 히히");
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
    socket.emit("Connect Hello", socket.nsp.name);
  }

  // OnGatewayDisconnect 인터페이스의 메서드 구현
  handleDisconnect(
    @ConnectedSocket() socket: Socket
    // client: any
  ) {
    // 클라이언트 연결 해제 시 처리할 로직을 구현합니다.
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
