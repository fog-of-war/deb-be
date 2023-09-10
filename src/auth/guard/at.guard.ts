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
      // 예외 처리 로직을 추가하거나 필요에 따라 로깅 등의 작업을 수행합니다.
      console.error("인증 예외 발생:", error);
      throw error; // 예외를 다시 throw하여 상위 핸들러에게 전파합니다.
    }
  }
}
