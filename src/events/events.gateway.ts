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
      // "NOTIFY", "ACTIVITY" 타입의 알림을 찾아서 클라이언트에게 전송
      await this.sendNotifyAlerts(socket, userId);
      await this.sendActivityAlerts(socket, userId);
    }
  }



  /** "NOTIFY" 알림이 생성되면 서버에 있는 모든 클라이언트에게 메시지 전송 */
  sendMessage(message?: any, @ConnectedSocket() socket?: Socket) {
    console.log(" \n 🌠 sendMessage \n", message);
    const stringMessage = JSON.stringify(message);
    this.server.emit("notification", stringMessage);
    return Promise.resolve("Message sent successfully");
  }


  /** 웹소켓 연결 해제시 */
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log("🐤웹소켓 연결해제");
  }


  /** 웹소켓 네임스페이스에 처음 연결 시 해당 유저에게 "NOTIFY" 전달 */
  sendToUserNamespaceNotify(userId: number, message: any) {
    this.server.to(`/v1/ws-alert-${userId}`).emit("notification", message);
    return Promise.resolve("Message sent successfully");
  }

  /** 
   * 1. 웹소켓 네임스페이스에 처음 연결 시 해당 유저에게 "ACTIVITY" 전달
   * 2. 댓글이 달릴 때 마다 해당 유저의 네임스페이스에 내용 전달 */
  sendToUserNamespaceActivity(userId: number, message: any) {
    this.server.to(`/v1/ws-alert-${userId}`).emit("activity", message);
    return Promise.resolve("Message sent successfully");
  }


 /** 
  * sendNotifyAlerts 메서드
  * "NOTIFY" 타입의 메시지 생성
 */
  async sendNotifyAlerts(socket: Socket, userId: number) {
    try {
      const notifyAlerts =await this.findNotifyAlerts();
      for (const notifyAlert of notifyAlerts) {
        const message = await this.makeNotifyAlertMessage(
          notifyAlert.alert_place_id
        );
        await this.sendToUserNamespaceNotify(userId, message);
      }
    } catch (error) {
      console.error("Error sending notify alerts:", error);
    }
  }
 /** -------------------- */

 /** 
  * "NOTIFY" 타입의 알림을 DB에서 찾아옴
  */
  async findNotifyAlerts(){
   return await this.prisma.alert.findMany({
      where: {
        alert_type: "NOTIFY",
      },
    });
  }
 /** -------------------- */
 
  /** 
  * "NOTIFY" 타입의 알림을 가공하여 메시지를 생성함
  */
  async makeNotifyAlertMessage(placeId) {
    const place = await this.prisma.place.findFirst({
      where: { place_id: placeId },
      select: { place_id: true, place_name: true, place_region: true },
    });

    const latestPost = await this.prisma.post.findFirst({
      where: { post_place_id: placeId, post_is_deleted: false },
      select: {
        post_id: true,
        post_created_at: true,
        post_updated_at: true,
        post_image_url: true,
      },
      orderBy: {
        post_created_at: "desc", 
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
 /** -------------------- */
 
  /** 
  * sendActivityAlerts 메서드
  * "ACTIVITY" 타입의 알림 메세지 생성 및 네임스페이스에 전송
  */
  async sendActivityAlerts(socket: Socket, userId: number) {
    try {
      const activityAlerts = await this.findActivityAlerts(userId);
      for (const activityAlert of activityAlerts) {
        const message = await this.makeCommentAlertMessage(
          activityAlert.alert_comment_id
        );
        this.sendToUserNamespaceActivity(userId, message);
      }
    } catch (error) {
      console.error("Error sending activity alerts:", error);
    }
  }
 /** -------------------- */
 
  /** 
  * "ACTIVITY" 타입의 알림을 DB에서 찾아옴
  */
   async findActivityAlerts(userId){
    return await this.prisma.alert.findMany({
       where: {
        alert_type: "ACTIVITY",
        alerted_user_id: userId,
       },
     });
   }
 /** -------------------- */

  /** 
  * "ACTIVITY" 타입의 알림을 가공하여 메시지를 생성함
  */
  async makeCommentAlertMessage(commentId) {
    try {
      if (typeof commentId !== "number" || commentId <= 0) {
        throw new NotFoundException("Invalid comment ID");
      }
      const comment = await this.prisma.comment.findFirst({
        where: { comment_id: commentId },
        include: { comment_author: true ,commented_post : {select: {post_place_id : true}}},
      });
      
      if (!comment) {
        throw new NotFoundException("Comment not found");
      }

      const message = {
        user_nickname: comment.comment_author.user_nickname,
        user_image_url: comment.comment_author.user_image_url,
        comment_id: comment.comment_id,
        comment_text: comment.comment_text,
        comment_created_at: comment.comment_created_at,
        commented_post_place_id : comment.commented_post.post_place_id
      };
 
      return message;
    } catch (error) {
      throw error; 
    }
  }
   /** -------------------- */
}

 
// private activeSockets: Record<string, Socket> = {};
// notifications:1 Access to XMLHttpRequest at 'http://api.yubinhome.com/socket.io/?EIO=4&transport=polling&t=OhzazFQ' from origin 'http://localhost:3000' has been blocked by CORS policy: notifications:1 Access to XMLHttpRequest at 'http://api.yubinhome.com/socket.io/?EIO=4&transport=polling&t=OhzazFQ' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: Redirect is not allowed for a preflight request.
    




/** 특정 클라이언트에게 메시지를 보내는 메서드 */
  // sendMessageToClient(socket: Socket, message: any) {
  //   socket.emit("message", message);
  //   return Promise.resolve("Message sent successfully");
  // }
  // /** 메시지 전송 */
  // sendNotification(message?: any, @ConnectedSocket() socket?: Socket) {
  //   console.log(" \n 🌠 sendMessage \n", message);
  //   const stringMessage = JSON.stringify(message);
  //   this.server.emit("notification", stringMessage);
  //   return Promise.resolve("Message sent successfully");
  // }
