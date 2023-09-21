import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class RanksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async updateRanks() {
    const users = await this.prisma.user.findMany({
      where: { user_is_deleted: false },
      orderBy: {
        user_points: "desc",
      },
    });

    for (const [rank, user] of users.entries()) {
      await this.prisma.userRanking.upsert({
        where: { user_id: user.user_id },
        create: {
          user_id: user.user_id,
          user_points: user.user_points,
          rank: rank + 1, // Update: Calculate and set the user's rank
        },
        update: {
          user_points: user.user_points,
          rank: rank + 1, // Update: Calculate and update the user's rank
        },
      });
    }
  }

  async getAllUserRanks() {
    await this.updateRanks();
    const userRanks = await this.prisma.userRanking.findMany({
      orderBy: {
        user_points: "desc",
      },
    });
    if (userRanks) {
      const formattedUserRanks = await Promise.all(
        userRanks.map(async (userRank) => {
          const user = await this.prisma.user.findUnique({
            where: {
              user_id: userRank.user_id,
              user_is_deleted: false,
            },
            select: {
              user_id: true,
              user_nickname: true,
              user_image_url: true,
              user_points: true,
              user_badges: true,
            },
          });
          return {
            user_id: user.user_id,
            user_nickname: user.user_nickname,
            user_image_url: user.user_image_url,
            user_points: user.user_points,
            user_badges_count: user.user_badges.length,
            rank: userRank.rank,
          };
        })
      );
      return formattedUserRanks;
    } else {
      return null;
    }
  }

  async getUserRank(userId: number) {
    await this.updateRanks();
    const userRank = await this.prisma.userRanking.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: {
        user_points: "desc",
      },
    });
    if (userRank) {
      return userRank; // Return the user's rank
    } else {
      return null; // 사용자가 랭킹에 없을 경우
    }
  }

  async getRegionRanksByRegion() {
    // 1. 모든 유저의 지역 방문 정보 조회
    const allUsers = await this.prisma.user.findMany({
      where: { user_is_deleted: false },
      include: { user_visited_places: { include: { visited_place: true } } },
    });

    // 2. 지역 방문 횟수 계산
    const regionVisitCounts = {};
    allUsers.forEach((user) => {
      user.user_visited_places.forEach((placeVisit) => {
        const regionId = placeVisit.visited_place.place_region_id;
        if (!regionVisitCounts[regionId]) {
          regionVisitCounts[regionId] = 1;
        } else {
          regionVisitCounts[regionId]++;
        }
      });
    });

    // 3. 지역 방문 횟수를 기준으로 랭킹 생성
    const ranking = Object.keys(regionVisitCounts)
      .map((regionId) => ({
        regionId: parseInt(regionId),
        visitCount: regionVisitCounts[regionId],
      }))
      .sort((a, b) => b.visitCount - a.visitCount);
    return ranking;
  }

  async generateUserRankingForRegion(regionId) {
    // 1. 모든 유저의 지역 방문 정보 조회
    const allUsers = await this.prisma.user.findMany({
      where: { user_is_deleted: false },
      include: {
        user_visited_places: { include: { visited_place: true } },
        user_badges: true,
        user_selected_badge: true,
      },
    });
    // 2. 특정 지역에 대한 방문 횟수 계산
    let regionVisitCount = 0;
    allUsers.forEach((user) => {
      user.user_visited_places.forEach((placeVisit) => {
        if (placeVisit.visited_place.place_region_id === regionId) {
          regionVisitCount++;
        }
      });
    });

    // 3. 지역 방문 횟수를 기준으로 유저 랭킹 생성
    const userRanking = allUsers
      .map((user) => ({
        user_id: user.user_id,
        user_nickname: user.user_nickname,
        user_image_url: user.user_image_url,
        user_selected_badge: user.user_selected_badge.badge_name,
        visit_count: user.user_visited_places.filter(
          (placeVisit) => placeVisit.visited_place.place_region_id === regionId
        ).length,
      }))
      .filter((user) => user.visit_count > 0)
      .sort((a, b) => b.visit_count - a.visit_count)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
    return { userRanking };
  }

  async generateUserRankingByAllRegions() {
    try {
      // const cachedItem = await this.cacheManager.get(`cached_item_region_rank`);
      // if (cachedItem) {
      //   console.log("Cached result found");
      //   return cachedItem;
      // }

      const result = [];

      for (let i = 1; i <= 25; i++) {
        const rankItem = { region: undefined, ranking: undefined };
        rankItem.ranking = (
          await this.generateUserRankingForRegion(i)
        ).userRanking;
        rankItem.region = await this.prisma.region.findFirst({
          where: { region_id: i },
        });

        const firstPost = await this.prisma.region.findFirst({
          where: { region_id: i },
          include: {
            region_place: {
              include: {
                place_posts: {
                  take: 1,
                },
              },
            },
          },
        });

        if (firstPost?.region_place[0]?.place_posts[0]?.post_image_url) {
          rankItem.region.region_thumbnail_url =
            firstPost.region_place[0].place_posts[0].post_image_url;
        }

        result.push(rankItem);
      }

      // if (result.length > 0) {
      //   await this.cacheManager.set(`cached_item_region_rank`, result, 30);
      //   console.log("캐시 저장 완료");
      // }

      return result;
    } catch (error) {
      console.error("에러 발생:", error);
      // 에러 처리 로직 추가
      throw error;
    }
  }
}
