import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, EditUserDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { user_id: userId },
      data: { ...dto },
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
    return this.prisma.user.create({
      data: userDto,
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
