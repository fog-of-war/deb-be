import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

@Injectable()
export class PlaceStarRatingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {

        // A
        if (Array.isArray(data)) {
          const result = data.map((item) => {
            if (item.place_star_rating !== null) {
              return { ...item, place_star_rating: parseFloat(item.place_star_rating.toFixed(1)) };
            }
            return item;
          });
          console.log("Array.isArray", result);
          return result;
        } 
        else if (typeof data === 'object' && data.place_star_rating !== null) {
          data.place_star_rating = parseFloat(data.place_star_rating.toFixed(1));
          console.log("else if")
          return data;
        }
        return data;
      }),
      toArray() // 배열로 수집
    );
  }
}
