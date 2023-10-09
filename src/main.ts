import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as passport from "passport";
import { PrismaService } from "./prisma/prisma.service";
import { LoggerService } from "./logger/logger.service";
import { HttpExceptionFilter, UnauthorizedExceptionFilter } from "./filters";
import { EventsGateway } from "./events/events.gateway";
import { PostsService } from "./posts/posts.service";
import * as posts from "./prisma/posts.json";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  /** app 초기화 */
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  //  bufferLogs 를 true 로 만들면 로그 메시지가 일정량만큼 쌓였을 때 한 번에 출력되므로 로그의 수가 줄어들어 성능에 도움이 될 수 있습니다.
  /** -------------------- */

  /** logger 설정 */
  app.useLogger(app.get(LoggerService));
  /** -------------------- */

  /** cors 설정 */
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
  /** -------------------- */

  /** api 주소 버전을 url 에 바인딩 */
  app.setGlobalPrefix("v1");
  /** -------------------- */

  /** classValidator 예외 필터 */
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
  /** -------------------- */

  /** 글로벌 예외 필터 */
  app.useGlobalFilters(
    new UnauthorizedExceptionFilter(),
    new HttpExceptionFilter()
  );
  /** -------------------- */

  /** Prisma 로 DB에 seeding */
  const prismaService = app.get(PrismaService);
  await prismaService.cleanDb(); // 기존 데이터 삭제 (선택사항)
  async function insertAdminPosts() {
    try {
      const postsData = posts as Array<any>; // JSON 파일을 배열로 변환

      const isExist = await postsService.getPosts();
      if (isExist.length == 0) {
        for (const post of postsData) {
          await postsService.createPost(1, post);
        }
      }
    } catch (error) {
      // 에러 처리 코드를 여기에 추가합니다.
      console.error("insertAdminPosts 함수에서 에러 발생:", error);
      // 필요한 경우 에러를 더 자세히 처리할 수 있습니다.
    }
  }
  const postsService = app.get(PostsService);
  insertAdminPosts();
  /** -------------------- */

  /** Passport 설정 */
  app.use(passport.initialize());
  /** -------------------- */

  // const eventGateway = app.get(EventsGateway);
  // setInterval(() => eventGateway.sendMessage(), 2000);

  /** cookieParser 설정 */
  app.use(cookieParser());
  app.enableCors({
    origin: ["http://localhost"],
    credentials: true,
  });
  /** -------------------- */

  /** 스웨거 설정 */
  const config = new DocumentBuilder()
    .setTitle("Fog of war example")
    .setDescription("The Fog of war API description")
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
  /** -------------------- */

  await app.listen(5000);
}
bootstrap();
