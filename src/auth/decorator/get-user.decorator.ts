import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    // switchToHTTP 대신 웹소켓이나 rdc도 쓸 수 있습니다.
    if (data) {
      return request.user[data];
    }

    return request.user;
  }
);
