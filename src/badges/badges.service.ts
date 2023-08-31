import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {}

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

  async checkAndAssignBadge(userId: number) {
    // 1. 유저 정보 가져오기
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { user_badges: true, user_visited_places: true },
    });

    // 배열에서 방문한 장소 아이디 추출
    const user_visited_places_lists = user.user_visited_places.map((item) => {
      return item.visited_place_id;
    });

    // 장소 아이디 배열을 사용하여 장소 정보 조회
    const user_visited_place = await this.prisma.mapPlaceCategory.findMany({
      where: {
        placeId: { in: user_visited_places_lists },
      },
    });

    // categoryId별로 갯수를 세기 위한 객체 생성
    const categoryIdCountsFromUserVisitedPlaces = {};
    // 유저가 방문한 각 장소의 categoryId를 기반으로 카운트 증가
    for (const placeInfo of user_visited_place) {
      const categoryId = placeInfo.categoryId;
      if (categoryIdCountsFromUserVisitedPlaces[categoryId]) {
        categoryIdCountsFromUserVisitedPlaces[categoryId]++;
      } else {
        categoryIdCountsFromUserVisitedPlaces[categoryId] = 1;
      }
    }
    // 3. 장소의 카테고리와 관련된 뱃지 정보 가져오기
    const badgeIdsByCategoryId = {};
    // 각 categoryId에 대해 badge_id 가져오기
    for (const placeInfo of user_visited_place) {
      const categoryId = placeInfo.categoryId;
      if (categoryIdCountsFromUserVisitedPlaces[categoryId]) {
        const badgeIds = await this.getBadgeIdByCategoryId(Number(categoryId));
        badgeIdsByCategoryId[categoryId] = badgeIds;
      }
    }
    // 4. 유저가 해당 뱃지를 이미 보유하고 있는지 확인
    const userBadgeIds = user.user_badges.map((badge) => badge.badge_id);


    for (const categoryId in badgeIdsByCategoryId) {

      /** 장소의 카테고리와 관련된 뱃지가 유효한지 검증 */
      if (badgeIdsByCategoryId.hasOwnProperty(categoryId)) {
        const badgeIds = badgeIdsByCategoryId[categoryId];

        /** 사용자가 작성한 게시물 장소와 동일한 카테고리를 가진 뱃지를 검색 : 🛡️ */
        for (const badgeId of badgeIds) {
          const badge = await this.prisma.badge.findUnique({
            where: { badge_id: badgeId },
          });

          /** 
           * 뱃지 부여 로직
           * 1. 뱃지의 카테고리id 와  🛡️ 의 카테고리 아이디가 동일하고
           * 2. 뱃지와 동일한 카테고리를 가진 장소의 갯수와 badge_criteria 를 비교 (categoryIdCountsFromUserVisitedPlaces)
           * 3. 유저가 해당 뱃지를 가지지 않은 경우
           */
          if (
            badge.badge_category_id === Number(categoryId) &&
            categoryIdCountsFromUserVisitedPlaces[categoryId] >= badge.badge_criteria &&
            !userBadgeIds.includes(badgeId)
          ) {
            // 5. 조건을 충족할 경우 뱃지 부여
            // 조건을 충족하고 뱃지를 보유하지 않은 경우
            // 뱃지 부여 로직 추가
            await this.assignBadgeToUser(userId, badgeId);
            this.logger.log(`User ${userId} is awarded badge ${badgeId}`);
          }
        }
      }
    }
  }

  // 각 categoryId에 해당하는 badge_id를 가져오는 함수
  async getBadgeIdByCategoryId(categoryId: number) {
    const categoryBadges = await this.prisma.badge.findMany({
      where: { badge_category_id: categoryId },
    });
    return categoryBadges.map((badge) => badge.badge_id);
  }
}
