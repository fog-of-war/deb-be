import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class ATGuard extends AuthGuard("jwt-access") {
  private readonly logger = new Logger(ATGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // this.logger.log(ATGuard.name);
    if (await super.canActivate(context)) {
      return true;
    }
    return false;
  }

  handleRequest(err, user, info) {
    try {
      if (err || !user) {
        throw new UnauthorizedException("회원정보 인증에 실패하였습니다");
      }
      return user;
    } catch (error) {
      console.error("인증 예외 발생:", error);
      throw error;
    }
  }
}
