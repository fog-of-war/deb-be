import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { RanksService } from "./ranks.service";
import { CreateRankDto } from "./dto/create-rank.dto";
import { UpdateRankDto } from "./dto/update-rank.dto";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "src/auth/guard";
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
} from "@nestjs/swagger";
import {
  GetOneRankResponse,
  GetManyRanksResponse,
  RegionRanking,
} from "./responses";
import { identity } from "rxjs";

@ApiTags("ranks")
@Controller("ranks")
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  @ApiOperation({ summary: "전체 랭킹 가져오기" })
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
  @ApiOperation({ summary: "나의 랭킹 가져오기" })
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
  @Get("/region")
  @ApiOperation({ summary: "모든 구별 랭킹 가져오기" })
  @ApiParam({ name: "id", description: "해당 구의 아이디" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [RegionRanking], // 반환 모델을 지정
  })
  async getRanksByAllRegion() {
    const result = await this.ranksService.generateUserRankingByAllRegions();
    return result;
  }

  @Get("/region/:id")
  @ApiOperation({ summary: "구별 랭킹 가져오기" })
  @ApiParam({ name: "id", description: "해당 구의 아이디" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetManyRanksResponse], // 반환 모델을 지정
  })
  async getRanksByRegion(@Param("id", ParseIntPipe) region_id: string) {
    const result = await this.ranksService.generateUserRankingForRegion(
      region_id
    );
    return result.userRanking;
  }
}
