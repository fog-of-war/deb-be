import { Injectable } from '@nestjs/common';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RanksService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async updateRanks() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        user_points: 'desc'
      }
    });

    for (const [rank, user] of users.entries()) {
      await this.prisma.userRanking.upsert({
        where: { user_id: user.user_id },
        create: {
          user_id: user.user_id,
          user_points: user.user_points,
          rank: rank + 1 // Update: Calculate and set the user's rank
        },
        update: {
          user_points: user.user_points,
          rank: rank + 1 // Update: Calculate and update the user's rank
        }
      });
    }
  }

  async getAllUserRanks() {
    await this.updateRanks();
    const userRanks = await this.prisma.userRanking.findMany({
      orderBy: {
        user_points: 'desc',
      },
    });
    if (userRanks) {
      const formattedUserRanks = await Promise.all(
        userRanks.map(async (userRank) => {
          const user = await this.prisma.user.findUnique({
            where: {
              user_id: userRank.user_id,
            },
            select: {
              user_id: true,
              user_nickname: true,
              user_image_url: true,
              user_points: true,
            },
          });
          return {
            user_id: user.user_id,
            user_nickname: user.user_nickname,
            user_image_url: user.user_image_url,
            user_points: user.user_points,
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
    await this.updateRanks() 
    const userRank = await this.prisma.userRanking.findFirst({
      where: {
        user_id: userId
      },
      orderBy: {
        user_points: 'desc'
      }
    });
    if (userRank) {
      return userRank; // Return the user's rank
    } else {
      return null; // 사용자가 랭킹에 없을 경우
    }
  }


}