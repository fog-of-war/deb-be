import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import { Cache } from "cache-manager";
@Injectable()
export class BadgesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /** 유저에게 뱃지를 부여하는 메서드 */
  async assignBadgeToUser(userId: number, badgeId: number) {
    try {
      const user = await this.prisma.user.update({
        where: { user_id: userId },
        data: {
          user_badges: {
            connect: { badge_id: badgeId },
          },
        },
      });

      const cachedItem = await this.cacheManager.get(`cached_item_${userId}`);

      if (cachedItem) {
        await this.cacheManager.del(`cached_item_${userId}`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error while assigning badge to user ${userId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * categoryId에 해당하는 badge_id를 가져오는 함수
   * categoryId를 기반으로 해당 카테고리에 대응되는 뱃지 정보를 가져오는 로직
   */
  async getBadgeIdByCategoryId(categoryId: number) {
    try {
      const categoryBadges = await this.prisma.badge.findMany({
        where: { badge_category_id: categoryId },
      });
      return categoryBadges.map((badge) => badge.badge_id);
    } catch (error) {
      this.logger.error(
        `Error while getting badge IDs by category ${categoryId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   *  유저의 뱃지정보와 방문장소 가져오기
   */
  async getUsersBadgesAndVisitedPlaceInfo(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: userId },
        include: { user_badges: true, user_visited_places: true },
      });
      return user;
    } catch (error) {
      this.logger.error(
        `Error while getting user badges and visited places for user ${userId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   *  유저가 방문한 장소 아이디 추출하여 배열 생성
   */
  async extractVisitedPlacesId(user) {
    try {
      const result = user.user_visited_places.map((item) => {
        return item.visited_place_id;
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error while extracting visited places IDs: ${error.message}`
      );
      throw error;
    }
  }
  /**
   *  장소 아이디 배열을 사용하여 장소 정보 조회
   */
  async getVisitedPlacesInfoByIds(user_visited_places_lists) {
    try {
      const result = await this.prisma.mapPlaceCategory.findMany({
        where: {
          placeId: { in: user_visited_places_lists },
        },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error while getting visited places info by IDs: ${error.message}`
      );
      throw error;
    }
  }
  /**
   *  유저가 방문한 각 장소의 categoryId를 기반으로 카운트 증가
   */
  async countPlacesCategory(user_visited_places) {
    try {
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
    } catch (error) {
      this.logger.error(
        `Error while counting places by category: ${error.message}`
      );
      throw error;
    }
  }

  /**
   *  장소의 카테고리와 관련된 뱃지 정보 가져오기
   */
  async getBadgesIdByCategoryId(
    categoryIdCountsFromUserVisitedPlaces,
    user_visited_places
  ) {
    try {
      const result = {};
      for (const placeInfo of user_visited_places) {
        const categoryId = placeInfo.categoryId;
        if (categoryIdCountsFromUserVisitedPlaces[categoryId]) {
          const badgeIds = await this.getBadgeIdByCategoryId(
            Number(categoryId)
          );
          result[categoryId] = badgeIds;
        }
      }
      return result;
    } catch (error) {
      this.logger.error(
        `Error while getting badges by category: ${error.message}`
      );
      throw error;
    }
  }

  /**
   *  유저가 해당 뱃지를 이미 보유하고 있는지 확인
   */
  async checkUserBadges(user) {
    try {
      const result = user.user_badges.map((badge) => badge.badge_id);
      return result;
    } catch (error) {
      this.logger.error(`Error while checking user badges: ${error.message}`);
      throw error;
    }
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
    try {
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
    } catch (error) {
      this.logger.error(
        `Error while processing badge awards for user ${userId}: ${error.message}`
      );
      throw error;
    }
  }

  async checkAndAssignBadge(userId: number) {
    try {
      // 1 categoryId를 기반으로 해당 카테고리에 대응되는 뱃지 정보를 가져오는 로직
      const user = await this.getUsersBadgesAndVisitedPlaceInfo(userId);

      // 2 유저가 방문한 장소 아이디 추출하여 배열 생성
      const user_visited_places_id_lists = await this.extractVisitedPlacesId(
        user
      );

      // 3 유저가 방문한 장소 아이디 배열을 사용하여 장소 정보 조회
      const user_visited_places = await this.getVisitedPlacesInfoByIds(
        user_visited_places_id_lists
      );

      // 4 유저가 방문한 각 장소의 categoryId를 기반으로 카운트 증가
      const categoryIdCountsFromUserVisitedPlaces =
        await this.countPlacesCategory(user_visited_places);

      // 5 장소의 카테고리와 관련된 뱃지 정보 가져오기
      const badgeIdsByCategoryId = await this.getBadgesIdByCategoryId(
        categoryIdCountsFromUserVisitedPlaces,
        user_visited_places
      );

      // 6 유저가 뱃지를 이미 보유하고 있는지 확인
      const userBadgeIds = await this.checkUserBadges(user);

      // 7
      await this.processBadgeAwards(
        badgeIdsByCategoryId,
        categoryIdCountsFromUserVisitedPlaces,
        userBadgeIds,
        userId
      );
    } catch (error) {
      this.logger.error(
        `Error while checking and assigning badges for user ${userId}: ${error.message}`
      );
      throw error;
    }
  }
}
