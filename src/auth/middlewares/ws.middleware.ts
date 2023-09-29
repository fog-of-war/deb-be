import { Socket } from "socket.io";
import { WsStrategy } from "../strategy";

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

/** 웹소켓 연결 시 사용자 인증 위한 미들웨어 */
export const SocketAuthMiddleware = (
  wsStrategy: WsStrategy
): SocketIOMiddleware => {
  return async (client, next) => {
    try {
      const { authorization } = client.handshake.headers;
      await wsStrategy.validateToken(authorization, client);
      next();
    } catch (error) {
      next(error);
    }
  };
};
