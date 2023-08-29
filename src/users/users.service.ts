import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, EditUserDto, InitUserDto } from "./dto";
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
      where: { user_id: userId },
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
  async findUserById(id: number): Promise<any | null> {
    return this.prisma.user.findFirst({
      where: {
        user_id: id,
      },
      include: { user_badges: true },
    });
  }
  async findUserByEmail(email: string): Promise<any | null> {
    return this.prisma.user.findFirst({
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
    return this.prisma.user.create({
      data: {
        ...userDto,
      },
    });
  }

  async leanUserInfo(user: any) {
    const selectedFields = [
      "user_id",
      "user_image_url",
      "user_nickname",
      "user_points",
      "user_level",
      "user_is_admin",
      "user_is_deleted",
      "user_badges",
      "user_visited_places",
      "user_authored_posts",
    ];
    // 방문장소말고 포스트에 장소 담아드리기
    const leanUser = {};

    selectedFields.forEach((field) => {
      leanUser[field] = user[field];
    });

    return leanUser;
  }
}
