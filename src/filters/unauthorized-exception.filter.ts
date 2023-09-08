import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { Logger } from "@nestjs/common"; // Logger 가져오기

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const logger = new Logger(UnauthorizedExceptionFilter.name);
    logger.log(
      UnauthorizedExceptionFilter.name,
      `UnauthorizedException caught: ${exception.message}`,
      exception.stack
    );
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    response.status(401).json({
      statusCode: 401,
      timestamp: new Date().toISOString(),
      message: "회원인증에 실패하였습니다 UnauthorizedExceptionFilter",
      error: "Unauthorized",
      path: request.url,
    });
  }
}
