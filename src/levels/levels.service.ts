import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}
  async updateLevel(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    const levels = await this.prisma.level.findMany({});

    // 레벨을 조건을 만족할 때까지 확인하여 업데이트
    for (const level of levels) {
      if (user.user_points < level.level_points) {
        break; // 조건을 만족하지 않으면 중단
      }

      // 사용자의 레벨을 업데이트
      await this.prisma.user.update({
        where: { user_id: userId },
        data: { user_level: level.level_level },
      });

      console.log(`User ${user.user_id} level updated to ${level.level_level}`);
    }
  }
}
