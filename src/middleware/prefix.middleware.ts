// src/middleware/prefix.middleware.ts

import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class PrefixMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.url = `/api/v1${req.url}`;
    next();
  }
}
