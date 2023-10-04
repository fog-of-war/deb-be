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
  constructor(private logger: LoggerService, private wsStrategy: WsStrategy) {}

  /** 웹소켓 초기화 */
  afterInit(client: Socket): any {
    this.logger.log("웹소켓 초기화");
    client.use(SocketAuthMiddleware(this.wsStrategy) as any);
  }

  /** 웹소켓 연결시 */
  handleConnection(@ConnectedSocket() socket: Socket, client: any) {
    const userInfo = socket.userInfo;
    console.log("handleConnection", userInfo); // 클라이언트의 정보에서 유저 정보 추출
    if (userInfo && userInfo.sub) {
      const userId = userInfo.sub;
      const roomName = `/v1/ws-alert-${userId}`;
      socket.join(roomName); // 클라이언트를 생성한 방에 조인
      // console.log("Client joined room:", roomName);
    }
  }
  // 특정 클라이언트에게 메시지를 보내는 메서드
  sendMessageToClient(socket: Socket, message: any) {
    socket.emit("message", message);
    return Promise.resolve("Message sent successfully");
  }

  /** 메시지 전송 */
  sendMessage(message?: any, @ConnectedSocket() socket?: Socket) {
    console.log(" \n 🌠 sendMessage \n", message);
    const stringMessage = JSON.stringify(message);
    // console.log(stringMessage);
    this.server.emit("message", stringMessage);
    return Promise.resolve("Message sent successfully");
  }

  /** 메시지 전송 */
  sendNotification(message?: any, @ConnectedSocket() socket?: Socket) {
    console.log(" \n 🌠 sendMessage \n", message);
    const stringMessage = JSON.stringify(message);
    // console.log(stringMessage);
    this.server.emit("notification", stringMessage);
    return Promise.resolve("Message sent successfully");
  }

  /** 웹소켓 연결 해제시 */
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log("🐤웹소켓 연결해제");
  }

  sendToUserNamespace(userId: number, message: any) {
    // console.log("sendToUserNamespace", message);
    // console.log(this.server);
    this.server.to(`/v1/ws-alert-${userId}`).emit("activity", message);
    return Promise.resolve("Message sent successfully");
  }
}

// private activeSockets: Record<string, Socket> = {};
