import { AuthGuard } from "@nestjs/passport";
import { Injectable, ExecutionContext } from "@nestjs/common";

@Injectable()
export class KakaoAuthGuard extends AuthGuard("kakao") {
  canActivate(context: ExecutionContext) {
    try {
      console.log(
        "🚀 ~ file: kakao.guard.ts:8 ~ KakaoAuthGuard ~ canActivate ~ 실행됨:"
      );

      return super.canActivate(context);
    } catch (error) {
      console.error(
        "🔥 ~ file: kakao.guard.ts:10 ~ KakaoAuthGuard ~ canActivate ~ error:",
        error
      );
      return false; // 예외 발생 시 인증 거부
    }
  }
}
