// log-method.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { LogMethodName } from "./decorator";

@Injectable()
export class LogMethodMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const methodName = LogMethodName(null, { getClass: () => req.route.stack[0].context });
    console.log(`Executing ${methodName}`);
    next();
  }
}
