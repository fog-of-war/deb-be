import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, EditUserDto, InitUserDto } from "./dto";
import { BadgesService } from "../badges/badges.service";
import { User } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private badgesService: BadgesService
  ) {}
  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { user_id: userId },
      data: { ...dto },
      select: {
        user_nickname: true,
        user_image_url: true,
        user_point: true,
        user_level: true,
        user_is_admin: true,
      },
    });
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
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
    console.log(
      "🚀 ~ file: users.service.ts:48 ~ UsersService ~ createUser ~ userWithBadge:",
      userWithBadge
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

  leanUserInfo(user: any) {
    const selectedFields = [
      "user_image_url",
      "user_nickname",
      "user_point",
      "user_level",
      "user_is_admin",
      "user_is_deleted",
      "user_badges",
      // "user_visited_places",
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
