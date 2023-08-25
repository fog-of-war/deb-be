import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async assignBadgeToUser(userId: number, badgeId: number) {
    const user = await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        user_badges: {
          connect: { badge_id: badgeId },
        },
      },
    });

    return user;
  }

  // BadgesService의 getBadgesByCategoryId 메서드
  async getBadgesByCategoryId(categoryId: number) {
    // categoryId를 기반으로 해당 카테고리에 대응되는 뱃지 정보를 가져오는 로직을 구현
    const categoryBadges = await this.prisma.badge.findMany({
      where: { badge_category_id: categoryId },
    });
    return categoryBadges;
  }

  async checkAndAssignBadge(userId: number, postPlaceId: number) {
    // 1. 유저 정보 가져오기
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    // 2. 포스트의 장소 정보 가져오기
    const place = await this.prisma.place.findUnique({
      where: { place_id: postPlaceId },
      include: { place_category_map: { include: { category: true } } },
    });

    if (!user || !place) {
      throw new Error("User or place not found");
    }
    // 3. 장소의 카테고리와 관련된 뱃지 정보 가져오기
    if (place) {
      const badgesToAssign = [];
      for (const categoryMap of place.place_category_map) {
        const categoryId = categoryMap.categoryId;
        const categoryBadges = await this.getBadgesByCategoryId(categoryId);
        badgesToAssign.push(...categoryBadges);
      }
      // 4. 유저가 해당 뱃지를 이미 보유하고 있는지 확인
      for (const badge of badgesToAssign) {
        const existingBadge = await this.prisma.badge.findFirst({
          where: {
            badge_id: badge.badge_id,
            badge_user_id: userId,
          },
        });

        let result;

        // 5. 조건을 충족할 경우 뱃지 부여
        if (!existingBadge && user.user_points >= badge.badge_criteria) {
          result = await this.prisma.user.update({
            where: { user_id: userId },
            data: {
              user_badges: {
                connect: [{ badge_id: badge.badge_id }],
              },
            },
          });
        }
        console.log(
          "🚀 ~ file: badges.service.ts:63 ~ BadgesService ~ checkAndAssignBadge ~ result:",
          result
        );
      }
    }
  }
}
