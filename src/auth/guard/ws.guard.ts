import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { WsStrategy } from "../strategy";
import { AuthGuard } from "@nestjs/passport";
import { Socket } from "socket.io";

/** 웹소켓 가드 : 인증에 성공한 사용자만 웹소켓에 연결 가능 */
@Injectable() // 이 데코레이터를 추가하여 싱글톤으로 등록
export class WsAuthGuard extends AuthGuard("jwt") {
  constructor(private wsStrategy: WsStrategy) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "ws") {
      return false;
    }
    const client: Socket = context.switchToWs().getClient();
    const { authorization } = client.handshake.headers;
    try {
      await this.wsStrategy.validateToken(authorization, client);
      return true; // 인증 성공
    } catch (error) {
      console.log(error);
      return false; // 인증 실패
    }
  }
}
