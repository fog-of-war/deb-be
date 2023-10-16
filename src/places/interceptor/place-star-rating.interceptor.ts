import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PlaceStarRatingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          // data가 배열인 경우 각 요소의 place_star_rating을 반올림하여 변경
          const result = data.map((item) => {
            if (item.place_star_rating !== undefined) {
              item.place_star_rating = parseFloat(item.place_star_rating.toFixed(1));
            }
          });
          // return result
        } else if (data && data.place_star_rating !== undefined) {
          // data가 객체인 경우 place_star_rating을 반올림하여 변경
          data.place_star_rating = parseFloat(data.place_star_rating.toFixed(1));
          return data
        }
        return data;
      }),
    );
  }
}
