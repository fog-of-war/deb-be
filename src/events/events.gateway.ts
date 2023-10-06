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
import { Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { onlineMap } from "./online";
import { WsAuthGuard } from "src/auth/guard";
import { ServerToClientEvents } from "./types";
import { SocketAuthMiddleware } from "src/auth/middlewares";
import { WsStrategy } from "src/auth/strategy";
import { PrismaService } from "src/prisma/prisma.service";

//ws://localhost:5000/v1/ws-alert postman 으로 성공
@WebSocketGateway({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization", "Authorization"],
    credentials: true,
  },
  namespace: /\/ws-.+/,
  transports: ["websocket", "polling"],
})
@UseGuards(WsAuthGuard)
@Injectable()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server<any, ServerToClientEvents>;
  constructor(
    private logger: LoggerService,
    private wsStrategy: WsStrategy,
    private prisma: PrismaService
  ) {}

  /** 웹소켓 초기화 */
  afterInit(client: Socket): any {
    this.logger.log("웹소켓 초기화");
    client.use(SocketAuthMiddleware(this.wsStrategy) as any);
  }

  /** 웹소켓 연결시 */
  async handleConnection(@ConnectedSocket() socket: Socket, client: any) {
    const userInfo = socket.userInfo;
    console.log("handleConnection", userInfo); // 클라이언트의 정보에서 유저 정보 추출
    if (userInfo && userInfo.sub) {
      const userId = userInfo.sub;
      const roomName = `/v1/ws-alert-${userId}`;
      socket.join(roomName); // 클라이언트를 생성한 방에 조인
      console.log("Client joined room:", roomName);
      // "NOTIFY" 타입의 알림을 찾아서 클라이언트에게 전송
      await this.sendNotifyAlerts(socket, userId);
      await this.sendActivityAlerts(socket, userId);
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

  sendToUserNamespaceNotify(userId: number, message: any) {
    // console.log("sendToUserNamespace", message);
    // console.log(this.server);
    this.server.to(`/v1/ws-alert-${userId}`).emit("notification", message);
    return Promise.resolve("Message sent successfully");
  }

  // sendNotifyAlerts 메서드 추가
  async sendNotifyAlerts(socket: Socket, userId: number) {
    try {
      // PrismaService를 사용하여 "NOTIFY" 타입의 알림을 조회
      const notifyAlerts = await this.prisma.alert.findMany({
        where: {
          alert_type: "NOTIFY",
        },
      });
      console.log("notifyAlerts", notifyAlerts);
      for (const notifyAlert of notifyAlerts) {
        // 각 알림을 클라이언트에게 보냅니다.
        const message = await this.makePostAlertMessage(
          notifyAlert.alert_place_id
        );
        this.sendToUserNamespaceNotify(userId, message);
      }
    } catch (error) {
      // 오류 처리
      console.error("Error sending notify alerts:", error);
    }
  }
  // sendActivityAlerts 메서드 추가
  async sendActivityAlerts(socket: Socket, userId: number) {
    try {
      // PrismaService를 사용하여 "ACTIVITY" 타입의 알림을 조회
      const activityAlerts = await this.prisma.alert.findMany({
        where: {
          alert_type: "ACTIVITY",
          alerted_user_id: userId,
        },
      });

      for (const activityAlert of activityAlerts) {
        // 각 알림을 클라이언트에게 보냅니다.
        const message = await this.makeCommentAlertMessage(
          activityAlert.alert_comment_id
        );
        this.sendToUserNamespace(userId, message);
      }
    } catch (error) {
      // 오류 처리
      console.error("Error sending activity alerts:", error);
    }
  }

  async makePostAlertMessage(placeId) {
    const place = await this.prisma.place.findFirst({
      where: { place_id: placeId },
      select: { place_id: true, place_name: true, place_region: true },
    });
    // 가장 최신 게시물 조회
    const latestPost = await this.prisma.post.findFirst({
      where: { post_place_id: placeId, post_is_deleted: false },
      select: {
        post_id: true,
        post_created_at: true,
        post_updated_at: true,
        post_image_url: true,
      },
      orderBy: {
        post_created_at: "desc", // post_created_at을 내림차순으로 정렬하여 최신 게시물을 선택
      },
    });
    const message = {
      place_id: place["place_id"],
      place_name: place["place_name"],
      region_name: place["place_region"]["region_name"],
      post_id: latestPost["post_id"],
      post_created_at: latestPost["post_created_at"],
      post_image_url: latestPost["post_image_url"],
    };
    return message;
  }

  async makeCommentAlertMessage(commentId) {
    try {
      if (typeof commentId !== "number" || commentId <= 0) {
        throw new NotFoundException("Invalid comment ID");
      }

      const comment = await this.prisma.comment.findFirst({
        where: { comment_id: commentId },
        include: { comment_author: true },
      });

      if (!comment) {
        // 댓글을 찾지 못한 경우 예외 throw
        throw new NotFoundException("Comment not found");
      }

      const message = {
        user_nickname: comment.comment_author.user_nickname,
        user_image_url: comment.comment_author.user_image_url,
        comment_id: comment.comment_id,
        comment_text: comment.comment_text,
        comment_created_at: comment.comment_created_at,
      };

      // console.log(message);
      return message;
    } catch (error) {
      // 예외 처리
      throw error; // 예외를 다시 던지거나, 에러 메시지를 로깅하거나, 적절한 에러 응답을 반환할 수 있습니다.
    }
  }
}

// private activeSockets: Record<string, Socket> = {};
// notifications:1 Access to XMLHttpRequest at 'http://api.yubinhome.com/socket.io/?EIO=4&transport=polling&t=OhzazFQ' from origin 'http://localhost:3000' has been blocked by CORS policy: notifications:1 Access to XMLHttpRequest at 'http://api.yubinhome.com/socket.io/?EIO=4&transport=polling&t=OhzazFQ' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: Redirect is not allowed for a preflight request.
