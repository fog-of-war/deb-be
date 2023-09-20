import { Injectable } from "@nestjs/common";
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

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly badgesService: BadgesService,
    private readonly ranksService: RanksService
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

  async findUserById(user_id: number): Promise<any | null> {
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
    // 랭킹 업데이트 로직 호출
    // await this.ranksService.getUserRank(user_id);
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
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, user_is_deleted: false },
      select: {
        user_badges: true,
        user_selected_badge: true,
      },
    });
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
      const result = await this.prisma.user.findFirst({
        where: { user_id: userId },
        select: { user_visited_places: { include: { visited_place: true } } },
      });
      const regions = await this.prisma.region.findMany({});
      const regionsWithVisitedCount = regions.map((region) => ({
        ...region,
        region_visited_count: 0,
      }));
      result.user_visited_places.forEach((item) => {
        const regionId = item.visited_place.place_region_id;

        const regionToUpdate = regionsWithVisitedCount.find(
          (region) => region.region_id === regionId
        );
        if (regionToUpdate) {
          regionToUpdate.region_visited_count++;
        }
      });
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
}
