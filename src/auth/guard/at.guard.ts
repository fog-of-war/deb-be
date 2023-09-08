import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class ATGuard extends AuthGuard("jwt-access") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    if (super.canActivate(context)) {
      return true;
    }
    // const request = context.switchToHttp().getRequest();
    // const response = context.switchToHttp().getResponse();
    // // JWT가 유효하지 않을 경우 직접 응답을 보냅니다.
    // response.status(401).json({
    //   statusCode: 401,
    //   timestamp: new Date().toISOString(),
    //   message: "회원인증에 실패하였습니다",
    //   error: "Unauthorized",
    // });

    return false;
  }
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw new UnauthorizedException("회원정보 인증에 실패하였습니다");
    }
    return user;
  }
}
