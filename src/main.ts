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
import { EventsGateway } from "./events/events.gateway";
import { PostsService } from "./posts/posts.service";
import * as posts from "./prisma/posts.json";

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

  async function insertAdminPosts() {
    const postsData = posts as Array<any>; // JSON 파일을 배열로 변환

    const isExist = await postsService.getPosts();
    if (isExist.length == 0) {
      for (const post of postsData) {
        await postsService.createPost(1, post);
      }
    }
  }

  const postsService = app.get(PostsService);

  insertAdminPosts();

  app.use(passport.initialize());

  // const eventGateway = app.get(EventsGateway);
  // setInterval(() => eventGateway.sendMessage(), 2000);

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
