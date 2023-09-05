import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";

export const LogMethodName = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const methodName = `${controller} -> ${handler}`;

    // 원하는 로거 객체를 사용하거나, 새로운 Logger 객체를 생성할 수 있습니다.
    const logger = new Logger();
    logger.log(`Executing ${methodName}`);

    return methodName;
  }
);