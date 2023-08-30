import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRt } from '../../auth/types';

export const GetCurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    console.log("🚀 ~ file: get-current-user.decorator.ts:9 ~  request.user[data]:",  request.user[data])
    return request.user;
  },
);
