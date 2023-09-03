import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KakaoAuthGuard extends AuthGuard("kakao") {
  async canActivate(context: any): Promise<boolean> {
    console.log(
      "🚀 ~ file: auth.guard.ts:68 ~ KakaoAuthGuard ~ canActivate ~ context:",
      context
    );
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    return result;
  }
}
