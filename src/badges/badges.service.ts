import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BadgesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
  ) {}

  /** 유저에게 뱃지를 부여하는 메서드 */
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

  /**
   * categoryId에 해당하는 badge_id를 가져오는 함수
   * categoryId를 기반으로 해당 카테고리에 대응되는 뱃지 정보를 가져오는 로직
   */
  async getBadgeIdByCategoryId(categoryId: number) {
    const categoryBadges = await this.prisma.badge.findMany({
      where: { badge_category_id: categoryId },
    });
    return categoryBadges.map((badge) => badge.badge_id);
  }

  /**
   *  유저의 뱃지정보와 방문장소 가져오기
   */
  async getUsersBadgesAndVisitedPlaceInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { user_badges: true, user_visited_places: true },
    });
    return user;
  }

  /**
   *  유저가 방문한 장소 아이디 추출하여 배열 생성
   */
  extractVisitedPlacesId(user) {
    const result = user.user_visited_places.map((item) => {
      return item.visited_place_id;
    });
    return result;
  }

  /**
   *  장소 아이디 배열을 사용하여 장소 정보 조회
   */
  async getVisitedPlacesInfoByIds(user_visited_places_lists) {
    const result = await this.prisma.mapPlaceCategory.findMany({
      where: {
        placeId: { in: user_visited_places_lists },
      },
    });
    return result;
  }

  /**
   *  유저가 방문한 각 장소의 categoryId를 기반으로 카운트 증가
   */
  async countPlacesCategory(user_visited_places) {
    const result = {};
    for (const placeInfo of user_visited_places) {
      const categoryId = placeInfo.categoryId;
      if (result[categoryId]) {
        result[categoryId]++;
      } else {
        result[categoryId] = 1;
      }
    }
    return result;
  }

  /**
   *  장소의 카테고리와 관련된 뱃지 정보 가져오기
   */
  async getBadgesIdByCategoryId(
    categoryIdCountsFromUserVisitedPlaces,
    user_visited_places
  ) {
    const result = {};
    for (const placeInfo of user_visited_places) {
      const categoryId = placeInfo.categoryId;
      if (categoryIdCountsFromUserVisitedPlaces[categoryId]) {
        const badgeIds = await this.getBadgeIdByCategoryId(Number(categoryId));
        result[categoryId] = badgeIds;
      }
    }
    return result;
  }

  /**
   *  유저가 해당 뱃지를 이미 보유하고 있는지 확인
   */
  checkUserBadges(user) {
    const result = user.user_badges.map((badge) => badge.badge_id);
    return result;
  }

  /**
   *  뱃지를 체크하고 부여하는 로직
   */
  async processBadgeAwards(
    badgeIdsByCategoryId,
    categoryIdCountsFromUserVisitedPlaces,
    userBadgeIds,
    userId
  ) {
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
           * 1. 뱃지의 카테고리id 와 🛡️ 의 카테고리 아이디가 동일하고
           * 2. 뱃지와 동일한 카테고리를 가진 장소의 갯수와 badge_criteria 를 비교 (categoryIdCountsFromUserVisitedPlaces)
           * 3. 유저가 해당 뱃지를 가지지 않은 경우
           */
          if (
            badge.badge_category_id === Number(categoryId) &&
            categoryIdCountsFromUserVisitedPlaces[categoryId] >=
              badge.badge_criteria &&
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

  async checkAndAssignBadge(userId: number) {
    // 1 categoryId를 기반으로 해당 카테고리에 대응되는 뱃지 정보를 가져오는 로직
    const user = await this.getUsersBadgesAndVisitedPlaceInfo(userId);

    // 2 유저가 방문한 장소 아이디 추출하여 배열 생성
    const user_visited_places_id_lists = this.extractVisitedPlacesId(user);

    // 3 유저가 방문한 장소 아이디 배열을 사용하여 장소 정보 조회
    const user_visited_places = await this.getVisitedPlacesInfoByIds(
      user_visited_places_id_lists
    );

    // 4 유저가 방문한 각 장소의 categoryId를 기반으로 카운트 증가
    const categoryIdCountsFromUserVisitedPlaces =
      this.countPlacesCategory(user_visited_places);

    // 5 장소의 카테고리와 관련된 뱃지 정보 가져오기
    const badgeIdsByCategoryId = this.getBadgesIdByCategoryId(
      categoryIdCountsFromUserVisitedPlaces,
      user_visited_places
    );

    // 6 유저가 뱃지를 이미 보유하고 있는지 확인
    const userBadgeIds = this.checkUserBadges(user);

    // 7
    await this.processBadgeAwards(
      badgeIdsByCategoryId,
      categoryIdCountsFromUserVisitedPlaces,
      userBadgeIds,
      userId
    );
  }
}
