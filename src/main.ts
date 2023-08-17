import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as passport from "passport";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://fog-of-war-gray.vercel.app",
      "https://yubinhome.com",
      "https://www.yubinhome.com",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // 인증 정보 허용
  });
  app.setGlobalPrefix("v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // 이 옵션을 추가하여 DTO에 정의되지 않은 속성은 필터링합니다.
      // 몰래 id 를 보내서 pk를 조작하려고 하는 등의 경우를 막아줌
      forbidNonWhitelisted: true, // 이 옵션을 추가하여 DTO에 정의되지 않은 속성이 들어올 경우 요청을 거부합니다.
    })
  );
  app.use(cookieParser());
  app.use(
    session({
      secret: "cutify",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const config = new DocumentBuilder()
    .setTitle("fog of war example")
    .setDescription("The fog of war API description")
    .setVersion("1.0")
    .addTag("fog of war")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  await app.listen(5000);
}
bootstrap();
