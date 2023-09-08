import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as passport from "passport";
import { PrismaService } from "./prisma/prisma.service";
import { LoggerService } from "./logger/logger.service";
import { UnauthorizedExceptionFilter } from "./filters";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerService));
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://fog-of-war-gray.vercel.app",
      "https://yubinhome.com",
      "https://www.yubinhome.com",
      "https://accounts.kakao.com",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // 인증 정보 허용
  });
  app.setGlobalPrefix("v1");
  // app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        // 여기서 원하는 예외 처리 로직을 구현합니다.
        // 예를 들어, 무조건 422 Unprocessable Entity를 반환하도록 만들 수 있습니다.
        const formattedErrors = validationErrors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));

        return new UnprocessableEntityException({
          statusCode: 422,
          message: "입력 형식을 확인하세요",
          errors: formattedErrors,
        });
      },
    })
  );
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.use(cookieParser());
  const prismaService = app.get(PrismaService);
  await prismaService.cleanDb(); // 기존 데이터 삭제 (선택사항)
  app.use(passport.initialize());

  const config = new DocumentBuilder()
    .setTitle("fog of war example")
    .setDescription("The fog of war API description")
    .setVersion("1.0")
    .addTag("fog of war")
    .addSecurity("access_token", {
      type: "http",
      scheme: "Bearer",
    })
    .addSecurity("refresh_token", {
      type: "http",
      scheme: "Bearer",
    })
    .addOAuth2()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  await app.listen(5000);
}
bootstrap();
