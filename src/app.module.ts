import { MiddlewareConsumer, Module, ValidationPipe  } from "@nestjs/common";
import { PlacesModule } from "./places/places.module";
import { UsersModule } from "./users/users.module";
import { BadgesModule } from "./badges/badges.module";
import { PostsModule } from "./posts/posts.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { CategoriesModule } from "./categories/categories.module";
import { PointsModule } from "./points/points.module";
import { LevelsModule } from "./levels/levels.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { RanksModule } from './ranks/ranks.module';
import { LoggerModule } from './logger/logger.module';
import * as redisStore from 'cache-manager-ioredis';
import { LogMethodMiddleware } from "./middleware/log-method.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PlacesModule,
    UsersModule,
    BadgesModule,
    PostsModule,
    AuthModule,
    PrismaModule,
    JwtModule,
    CategoriesModule,
    PointsModule,
    LevelsModule,
    EventEmitterModule.forRoot(),
    RanksModule,
    LoggerModule,  
    // CacheModule.register({
    //   store: redisStore,
    //   host: 'localhost',
    //   port: 6379,
    //   ttl: 100000, // 없는 경우 default 5초
    // }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {  
  configure(consumer: MiddlewareConsumer) {
  consumer.apply(LogMethodMiddleware).forRoutes("*"); // 모든 라우트에 Middleware 적용
}
}
