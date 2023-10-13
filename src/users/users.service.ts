import { Inject, Injectable, UseInterceptors } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  ChangeUserTitleDto,
  CreateUserDto,
  EditUserDto,
  InitUserDto,
} from "./dto";
import { BadgesService } from "../badges/badges.service";
// import { User } from "@prisma/client"; => 빌드시 지속 오류 사용보류
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

  /** -------------------- */

  /** 유저 정보 수정 */
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

  /** -------------------- */

  /** 메인페이지에서 필요한 유저정보 전달 */
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

  /** -------------------- */

  /** 유저 id 로 유저 찾기 */
  async findUserById(user_id: number): Promise<any | null> {
    const cachedItem = await this.cacheManager.get(`cached_item_${user_id}`);
    if (cachedItem) {
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
    if (user) {
      const cache = await this.cacheManager.set(
        `cached_item_${user_id}`,
        user,
        1
      );
      this.refreshUserCache(user_id);
    }
    return user;
  }
  /** -------------------- */

  /** 유저 email 로 유저 찾기 (신규 회원 가입 시 사용) */
  async findUserByEmail(email: string): Promise<any | null> {
    return await this.prisma.user.findFirst({
      where: {
        user_email: email,
        user_is_deleted: false,
      },
    });
  }
  /** -------------------- */

  /** 회원 가입 시 유저 생성 */
  async createUser(userDto: CreateUserDto) {
    const payload = {
      ...userDto,
    };
    // 사용자 초기화
    const createdUser = await this.initUser(payload);

    // 사용자에게 기본 뱃지 부여
    const badgeIdToAssign = 1; // 부여할 뱃지의 ID
    const userWithBadge = await this.badgesService.assignBadgeToUser(
      createdUser.user_id,
      badgeIdToAssign
    );

    return userWithBadge;
  }
  /** -------------------- */

  /** 사용자 초기화 */
  async initUser(userDto: any) {
    return await this.prisma.user.create({
      data: {
        ...userDto,
      },
    });
  }
  /** -------------------- */

  /** 유저의 뱃지를 가져오기 */
  async findUserBadges(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, user_is_deleted: false },
      select: {
        user_badges: true,
        user_selected_badge: true,
      },
    });
    return user;
  }
  /** -------------------- */

  /** 유저의 대표 칭호 변경 */
  async changeTitle(userId: number, dto: ChangeUserTitleDto) {
    const user = await this.prisma.user.update({
      where: { user_id: userId, user_is_deleted: false },
      data: {
        user_selected_badge: {
          connect: { badge_id: dto.user_selected_badge_id },
        },
      },
    });
    return user;
  }
  /** -------------------- */

  /** 유저가 방문한 지역의 갯수 세기 */
  async getMyVisitedRegionCount(userId: number) {
    try {
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
      return regionsWithVisitedCount;
    } catch (err) {
      console.log(err);
    }
  }
  /** -------------------- */

  /** 서비스 탈퇴 */
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
  /** -------------------- */

  /** 캐시 리프레시 */
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
      }
    }, 1000); // 1초 후에 캐시를 갱신
  }
}
