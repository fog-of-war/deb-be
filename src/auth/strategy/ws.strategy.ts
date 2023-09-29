import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { verify } from "jsonwebtoken";
import { Socket } from "socket.io";

// Socket 객체의 타입을 확장하여 userInfo 속성을 추가합니다.
declare module "socket.io" {
  interface Socket {
    userInfo?: any;
  }
}
/** 웹소켓 인증 전략 */
@Injectable()
export class WsStrategy {
  constructor(private configService: ConfigService) {}

  validateToken(authorization: string, socket: Socket) {
    if (authorization) {
      const token: string = authorization.split(" ")[1];
      const payload = verify(token, this.configService.get("AT_SECRET"), {
        ignoreExpiration: true,
      });
      // payload를 socket.userInfo에 저장
      socket.userInfo = payload;

      // payload를 로그로 출력하거나 필요한 처리를 수행합니다.
      // console.log("WsStrategy validateToken Token Payload:", payload);
      return payload;
    }
  }
}
