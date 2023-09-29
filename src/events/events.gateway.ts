import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { LoggerService } from "src/logger/logger.service";
import { Server, Socket } from "socket.io";
import { Injectable, UseGuards } from "@nestjs/common";
import { onlineMap } from "./online";
import { WsAuthGuard } from "src/auth/guard";
import { ServerToClientEvents } from "./types";
import { SocketAuthMiddleware } from "src/auth/middlewares";
import { WsStrategy } from "src/auth/strategy";

//ws://localhost:5000/v1/ws-alert postman 으로 성공
@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: /\/ws-.+/,
})
@UseGuards(WsAuthGuard)
@Injectable()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server<any, ServerToClientEvents>;
  // socket.io 서버로 웹소켓 서버를 하나 만든다(프로퍼티로)
  constructor(private logger: LoggerService, private wsStrategy: WsStrategy) {}

  afterInit(client: Socket): any {
    this.logger.log("웹소켓 초기화");
    client.use(SocketAuthMiddleware(this.wsStrategy) as any);
  }

  @SubscribeMessage("message")
  handleMessage(): any {
    return "hello";
  }

  sendMessage(@ConnectedSocket() socket?: Socket, message?: any): void {
    this.server.emit("message", message);
  }

  /**
   *
   *
   *
   *
   * 초기화 코드
   *
   *
   *
   *
   *
   */

  private activeSockets: Record<string, Socket> = {};
  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(
      `🐤웹소켓 연결 현재 네임스페이스: ${socket.nsp.name}, ${socket.id}`
    );
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
    socket.emit(
      `🐤웹소켓 연결 현재 네임스페이스: ${socket.nsp.name}, ${socket.id}`,
      socket.nsp.name
    );

    // 연결될 때마다 주기적으로 메시지를 보내는 인터벌 설정
    const interval = setInterval(() => {
      // eventGateway.sendMessage()를 사용하여 메시지를 보냅니다.
      const userInfo = socket.userInfo;
      console.log("interval User Info:", userInfo);
      this.sendMessage(socket, userInfo);
    }, 5000);

    // 연결이 해제될 때 인터벌을 종료합니다.
    socket.on("disconnect", () => {
      clearInterval(interval);
    });
  }
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log("🐤웹소켓 연결해제");
    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit("onlineList", Object.values(onlineMap[socket.nsp.name]));
  }

  // @SubscribeMessage("error")
  // handleErrorMessage(@MessageBody() error: string): void {
  //   this.server.emit("error", error);
  // }
}
