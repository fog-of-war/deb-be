import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { GetUser } from "../auth/decorator";
import { JwtGuard } from 'src/auth/guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetOneRankResponse,GetManyRanksResponse } from './responses';

@ApiTags("ranks")
@Controller('ranks')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetManyRanksResponse], // 반환 모델을 지정
  })
  async getRanks() {
    const result = await this.ranksService.getAllUserRanks();
    return result;
  }

  @Get("me")  
  @ApiResponse({
    status: 200,
    description: "",
    type: GetOneRankResponse, // 반환 모델을 지정
  })
  @ApiBearerAuth("access_token")
  @UseGuards(JwtGuard)
  async getRankByUserId(@GetUser("user_id") userId: number) {
    const result = await this.ranksService.getUserRank(userId);
    return result;
  }
}
