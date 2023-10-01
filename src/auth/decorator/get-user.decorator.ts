import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!data) return request.user;
    return request.user["sub"];
  }
);
