import { CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Socket } from "socket.io";

// export class WsAuthGuard extends AuthGuard("wsjwt") {
//   constructor() {
//     super();
//   }

//   getRequest(context: ExecutionContext) {

//     console.log("ws-at.guard", context.switchToWs().getClient().handshake);
//     return context.switchToWs().getClient().handshake;
//   }
// }
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): any | Promise<any> {
    if (context.getType() !== "ws") {
      return true;
    }
    const client: Socket = context.switchToWs().getClient();
    const { authorization } = client.handshake.headers;

    Logger.log({ authorization }, "i got the auth");
  }
}
