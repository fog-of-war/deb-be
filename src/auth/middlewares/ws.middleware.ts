import { Socket } from "socket.io";
import { WsStrategy } from "../strategy";

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  wsStrategy: WsStrategy
): SocketIOMiddleware => {
  return async (client, next) => {
    // 비동기 함수로 변경
    try {
      const { authorization } = client.handshake.headers;
      await wsStrategy.validateToken(authorization, client); // await 키워드 사용
      next();
    } catch (error) {
      next(error);
    }
  };
};
