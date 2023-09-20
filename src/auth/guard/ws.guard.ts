import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class WsAuthGuard extends AuthGuard("wsjwt") {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    console.log("ws-at.guard", context.switchToWs().getClient().handshake);
    return context.switchToWs().getClient().handshake;
  }
}
