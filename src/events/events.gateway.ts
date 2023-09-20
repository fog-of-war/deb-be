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
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventsService } from "./events.service";
import { PrismaService } from "src/prisma/prisma.service";

//ws://localhost:5000/v1/ws-alert postman 으로 성공

export const onlineMap = {};

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: /\/ws-.+/, // "options" 대신 "namespace"를 사용
})
@Injectable()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  constructor(private logger: LoggerService, private prisma: PrismaService) {}

  @SubscribeMessage("send_message")
  async handleEvent(@MessageBody() data: any): Promise<any> {
    this.logger.log("🐤웹소켓 send_message 이벤트 구독되는중", data);
    this.server.emit("receive_message", { message: data }); // 모든 클라이언트에게 메시지 전송
  }

  @SubscribeMessage("send_post_alert")
  async handleNotifyAlert(@MessageBody() data: any): Promise<any> {
    console.log("Received post alert event:", data);
    const result = await this.makePostAlertMessage(data.alert_place_id);
    this.server.emit("receive_post_alert", {
      message: result,
    });
  }

  @SubscribeMessage("send_activity_alert")
  async handleActivityAlert(@MessageBody() data: any): Promise<any> {
    console.log("Received activity alert event:", typeof data);
    console.log("Received activity alert event:", data);
    const result = await this.makeCommentAlertMessage(
      parseInt(data.alert_comment_id)
    );
    console.log(result);
    this.server.emit("receive_activity_alert", {
      message: result,
    });
  }

  @SubscribeMessage("error")
  handleErrorMessage(@MessageBody() error: string): void {
    console.error("🐤웹소켓 오류:", error);
    this.server.emit("🥺error", error);
  }

  afterInit(server: Server): any {
    this.logger.log("🐤웹소켓 초기화");
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
    this.logger.log("🐤웹소켓 연결해제");
    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit("onlineList", Object.values(onlineMap[socket.nsp.name]));
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

    console.log(message);
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
      console.log(message);
      return message;
    } catch (error) {
      // 예외 처리
      throw error; // 예외를 다시 던지거나, 에러 메시지를 로깅하거나, 적절한 에러 응답을 반환할 수 있습니다.
    }
  }
}
