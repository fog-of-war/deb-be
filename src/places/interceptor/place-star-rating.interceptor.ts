import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

@Injectable()
export class PlaceStarRatingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return this.handleArrayData(data);
        } else if (typeof data === 'object' && data.place_star_rating !== null) {
          return this.handleObjectData(data);
        }
        return data; // 나머지 경우에는 원래 형태로 반환
      })
    );
  }

  private handleArrayData(data: any[]) {
    const result = data.map((item) => {
      if (item.place_star_rating !== null) {
        return { ...item, place_star_rating: parseFloat(item.place_star_rating.toFixed(1)) };
      }
      return item;
    });
    // console.log("handleArrayData");
    return result;
  }

  private handleObjectData(data: any) {
    data.place_star_rating = parseFloat(data.place_star_rating.toFixed(1));
    // console.log("handleObjectData");
    return data;
  }
}
