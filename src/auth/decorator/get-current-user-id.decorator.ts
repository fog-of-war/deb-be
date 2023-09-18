import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayloadWithRt } from "../../auth/types";

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    console.log(request.user);
    if (!data) return request.user;
    return request.user["sub"];
  }
);
