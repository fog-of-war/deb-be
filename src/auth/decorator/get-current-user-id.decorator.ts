import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayloadWithRt } from "../../auth/types";

export const GetCurrentUserInfo = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    if (!data) {
      const userId = request.user["sub"];
      // console.log("GetCurrentUserId - User ID:", userId); // 사용자 ID를 로깅
      return request.user;
    }
    return request.user["sub"];
  }
);
