import { Socket } from "socket.io";
import { WsStrategy } from "../strategy";

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  wsStrategy: WsStrategy
): SocketIOMiddleware => {
  return (client, next) => {
    try {
      const { authorization } = client.handshake.headers;
      wsStrategy.validateToken(authorization);
      next();
    } catch (error) {
      next(error);
    }
  };
};
