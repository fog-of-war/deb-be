import { Module, ValidationPipe } from "@nestjs/common";
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
