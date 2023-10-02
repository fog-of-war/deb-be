import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
// import { AlertType } from "@prisma/client";
import { EventsGateway } from "src/events/events.gateway";

@Injectable()
export class AlertService {
  constructor(
    private prisma: PrismaService,
    private readonly eventsGateway: EventsGateway
  ) {}

  async createNotifyAlert(id: number) {
    const data = {
      alert_place_id: id,
      alert_type: "NOTIFY",
    };
    const alert = await this.prisma.alert.create({ data: data });
    const result = await this.makePostAlertMessage(id);
    console.log("createNotifyAlert", result);
    await this.eventsGateway
      .sendMessage(result)
      .then((response) => {
        // console.log("🌠 Notification sent successfully:", response);
      })
      .catch((error) => {
        console.error("🌠 Error sending notification:", error);
      });
    return result;
  }

  async createActivityAlert(id: number, post_author_id: number) {
    const data = {
      alert_comment_id: id,
      alert_type: "ACTIVITY",
      alerted_user: {
        connect: {
          user_id: post_author_id,
        },
      },
    };
    const alert = await this.prisma.alert.create({ data: data });
    const message = await this.makeCommentAlertMessage(id);
    const result = { ...message, alerted_user_id: alert["alerted_user_id"] };
    console.log("createActivityAlert");
    await this.eventsGateway
      .sendMessageToClient(result)
      .then((response) => {
        console.log("🌠 Notification sent successfully:", response);
      })
      .catch((error) => {
        console.error("🌠 Error sending notification:", error);
      });
    return result;
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

      console.log(message);
      return message;
    } catch (error) {
      // 예외 처리
      throw error; // 예외를 다시 던지거나, 에러 메시지를 로깅하거나, 적절한 에러 응답을 반환할 수 있습니다.
    }
  }
}
