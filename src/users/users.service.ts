import { Inject, Injectable, UseInterceptors } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  ChangeUserTitleDto,
  CreateUserDto,
  EditUserDto,
  InitUserDto,
} from "./dto";
import { BadgesService } from "../badges/badges.service";
// import { User } from "@prisma/client";
import { RanksService } from "src/ranks/ranks.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly badgesService: BadgesService,
    private readonly ranksService: RanksService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { user_id: userId, user_is_deleted: false },
      data: { ...dto },
      select: {
        user_nickname: true,
        user_image_url: true,
        user_points: true,
        user_level: true,
        user_is_admin: true,
      },
    });
    return user;
  }
  async findUserByIdForMain(user_id: number): Promise<any | null> {
    const user = await this.prisma.user.findFirst({
      where: { user_id: user_id, user_is_deleted: false },
      select: {
        user_id: true,
        user_image_url: true,
        user_nickname: true,
        user_points: true,
        user_level: true,
        user_is_deleted: true,
        user_badges: true,
        user_selected_badge: true,
        user_visited_places: true,
        user_authored_posts: true,
      },
    });
    return user;
  }
  async findUserById(user_id: number): Promise<any | null> {
    // console.log(`findUserById 58 user_id ${user_id}`);
    // 먼저 캐시에서 데이터를 가져오려고 시도합니다.
    const cachedItem = await this.cacheManager.get(`cached_item_${user_id}`);
    // 캐시에서 데이터가 있으면 해당 데이터를 반환합니다.
    if (cachedItem) {
      console.log(
        `findUserById 64 cached_item_${user_id} ` + "Cached result found"
      );
      if (
        cachedItem["user_nickname"] !== null &&
        cachedItem["user_image_url"] !== null
      ) {
        this.refreshUserCache(user_id);
        return cachedItem;
      }
    }
    const user = await this.prisma.user.findFirst({
      where: { user_id: user_id, user_is_deleted: false },
      select: {
        user_id: true,
        user_image_url: true,
        user_nickname: true,
        user_points: true,
        user_level: true,
        user_is_admin: true,
        user_is_deleted: true,
        user_badges: true,
        user_selected_badge: true,
        user_visited_places: true,
        user_authored_posts: true,
      },
    });
    // console.log(`findUserById 89 user`);
    // console.log(user);
    // 데이터를 캐시에 저장합니다.
    if (user) {
      const cache = await this.cacheManager.set(
        `cached_item_${user_id}`,
        user,
        1
      );
      this.refreshUserCache(user_id);
      console.log("캐시저장완료");
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<any | null> {
    return await this.prisma.user.findFirst({
      where: {
        user_email: email,
      },
    });
  }

  async createUser(userDto: CreateUserDto) {
    const payload = {
      ...userDto,
    };
    // 사용자에게 뱃지 부여
    const createdUser = await this.initUser(payload);
    const badgeIdToAssign = 1; // 부여할 뱃지의 ID
    const userWithBadge = await this.badgesService.assignBadgeToUser(
      createdUser.user_id,
      badgeIdToAssign
    );

    return userWithBadge;
  }

  async initUser(userDto: any) {
    return await this.prisma.user.create({
      data: {
        ...userDto,
      },
    });
  }

  async findUserBadges(userId: number) {
    const cachedItem = await this.cacheManager.get(`cached_item_${userId}`);
    if (cachedItem) {
      console.log("Cached badges found", cachedItem);
      if (
        cachedItem["user_nickname"] !== null &&
        cachedItem["user_image_url"] !== null
      ) {
        return cachedItem;
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, user_is_deleted: false },
      select: {
        user_badges: true,
        user_selected_badge: true,
      },
    });

    // 데이터를 캐시에 저장합니다.
    if (user) {
      await this.cacheManager.set(`cached_item_${userId}`, user, 3);
      this.refreshUserCache(userId);
      // console.log("캐시 저장");
    }

    return user;
  }

  async changeTitle(userId: number, dto: ChangeUserTitleDto) {
    const user = await this.prisma.user.update({
      where: { user_id: userId, user_is_deleted: false },
      data: {
        user_selected_badge: {
          connect: { badge_id: dto.user_selected_badge_id }, // ChangeUserTitleDto에 선택한 뱃지 ID를 포함해야 함
        },
      },
    });
    return user;
  }

  async getMyVisitedRegionCount(userId: number) {
    try {
      // const cachedItem = await this.cacheManager.get(`cached_item_${userId}`);
      // if (cachedItem) {
      //   console.log("Cached visited regions found");
      //   if (
      //     cachedItem["user_nickname"] !== null &&
      //     cachedItem["user_image_url"] !== null &&
      //     cachedItem["user_visited_regions"] !== null
      //   ) {
      //     return cachedItem;
      //   }
      // }

      const result = await this.prisma.user.findFirst({
        where: { user_id: userId },
        select: { user_visited_places: { include: { visited_place: true } } },
      });
      const regions = await this.prisma.region.findMany({});
      const regionsWithVisitedCount = regions.map((region) => ({
        ...region,
        region_visited_count: 0,
      }));
      if (result.user_visited_places.length != 0) {
        result.user_visited_places.forEach((item) => {
          const regionId = item.visited_place.place_region_id;

          const regionToUpdate = regionsWithVisitedCount.find(
            (region) => region.region_id === regionId
          );
          if (regionToUpdate) {
            regionToUpdate.region_visited_count++;
          }
        });
      } else {
        return [];
      }
      // 데이터를 캐시에 저장합니다.
      // await this.cacheManager.set(
      //   `cached_item_${userId}`,
      //   regionsWithVisitedCount,
      //   1
      // );
      // this.refreshUserCache(userId);
      // // console.log("캐시 저장");
      return regionsWithVisitedCount;
    } catch (err) {
      console.log(err);
    }
  }

  async leaveService(userId: number) {
    const result = await this.prisma.user.update({
      where: { user_id: userId, user_is_deleted: false },
      data: {
        user_is_deleted: true,
        user_email: "deleted",
        user_nickname: "탈퇴한사용자",
        user_refresh_token: null,
        user_delete_at: new Date(),
      },
    });
    return result;
  }
  // 백그라운드에서 캐시를 갱신하는 메서드
  private async refreshUserCache(userId: number) {
    setTimeout(async () => {
      const user = await this.prisma.user.findFirst({
        where: { user_id: userId, user_is_deleted: false },
        select: {
          user_id: true,
          user_image_url: true,
          user_nickname: true,
          user_points: true,
          user_level: true,
          user_is_admin: true,
          user_is_deleted: true,
          user_badges: true,
          user_selected_badge: true,
          user_visited_places: true,
          user_authored_posts: true,
        },
      });

      if (user) {
        await this.cacheManager.set(`cached_item_${userId}`, user, 1);
        // console.log(`Refreshed cached_item_${userId}`);
      }
    }, 1000); // 1초 후에 캐시를 갱신
  }
}
