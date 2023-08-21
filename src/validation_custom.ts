import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidationPipe422 implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // value는 들어오는 요청의 바디 데이터입니다.
    // metadata는 요청의 메타데이터 정보입니다.

    // DTO 유효성 검사 수행
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    // 유효성 검사 실패 시 422 에러 반환
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed", "422");
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
