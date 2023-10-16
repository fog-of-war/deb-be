import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class UserSubCheckInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const originalUserSub = request.user.sub;

    return next.handle().pipe(
      switchMap(async (data) => {
        if (user['sub'] && data.user_id) {
          console.log("user['sub']",user['sub'])
          console.log("data.user_id",data.user_id)
          if (data.user_id && originalUserSub !== undefined && data.user_id !== originalUserSub) {
            // user["sub"] 값이 변경되었으므로 해당 메서드를 다시 호출합니다.
            this.logger.log("UserSubCheckInterceptor : user['sub'] 가 동일하지 않습니다 " + originalUserSub +  "!==" + data.user.user_id)
            return await next.handle().toPromise();
          }
        }
        return data;
      }),
    );
  }
}

/** return await next.handle().toPromise();는 RxJS의 Observable을 사용하여 작성된 코드입니다. 이 코드는 next.handle()로부터 반환된 Observable을 Promise로 변환하여 비동기 작업을 수행합니다.

여기에서 간단한 설명을 제공하겠습니다:

next.handle()는 현재 인터셉터가 실행 중인 요청을 처리하는데 사용되는 Observable을 반환합니다. 즉, 컨트롤러 메서드의 실행을 나타냅니다.

.toPromise()는 Observable을 Promise로 변환하는 메서드입니다. 이를 통해 Observable이 아닌 비동기 코드와 함께 작업할 수 있습니다.

따라서 return await next.handle().toPromise();은 현재 인터셉터가 다시 next.handle()을 호출하고 해당 Observable을 Promise로 변환하여 현재 요청을 다시 실행하도록 하는 코드입니다. 이것은 user["sub"] 값이 변경된 경우에 해당 메서드를 한 번 더 실행하도록 하는 부분입니다. */