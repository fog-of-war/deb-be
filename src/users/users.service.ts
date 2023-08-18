import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, EditUserDto, InitUserDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
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

  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        user_email: email,
      },
    });
  }

  async createUser(userDto: CreateUserDto) {
    const payload = {
      ...userDto,
      // user_authored_posts: [],
      // user_visited_places: [],
      // user_badges: [],
    };

    return this.initUser(payload);
  }

  async initUser(userDto: any) {
    console.log(userDto);
    return this.prisma.user.create({
      data: {
        ...userDto,
      },
    });
  }

  leanUserInfo(user: any) {
    delete user.user_id;
    delete user.user_providerId;
    delete user.is_deleted;
    delete user.user_created_at;
    delete user.user_updated_at;
    delete user.user_refresh_token;
    return user;
  }
}
