import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { GetUser } from "../auth/decorator";
import { JwtGuard } from 'src/auth/guard';

@Controller('ranks')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  async getRanks() {
      const result = await this.ranksService.getAllUserRanks();
      return result;
  }

  @Get("me")
  @UseGuards(JwtGuard)
  async getRankByUserId(@GetUser("user_id") userId: number) {
    const result = await this.ranksService.getUserRank(userId);
    return result;
  }
}
