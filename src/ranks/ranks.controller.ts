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
  UseInterceptors,
} from "@nestjs/common";
import { RanksService } from "./ranks.service";
import { CreateRankDto } from "./dto/create-rank.dto";
import { UpdateRankDto } from "./dto/update-rank.dto";
import { GetCurrentUser, GetCurrentUserInfo, GetUser } from "../auth/decorator";
import { ATGuard, JwtGuard } from "src/auth/guard";
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
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from "@nestjs/cache-manager";
import { UserSubCheckInterceptor } from "src/common/interceptor";

@UseInterceptors(UserSubCheckInterceptor)
@ApiTags("ranks")
@Controller("ranks")
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}
  /** -------------------- */

  /** 전체 랭킹 가져오기 */
  @Get()
  @ApiOperation({ summary: "전체 랭킹 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetManyRanksResponse], 
  })
  async getRanks() {
    const result = await this.ranksService.getAllUserRanks();
    return result;
  }
  /** -------------------- */

  /** 나의 랭킹 가져오기 */
  @Get("me")
  @ApiOperation({ summary: "나의 랭킹 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: GetOneRankResponse, 
  })
  @ApiBearerAuth("access_token")
  @UseGuards(ATGuard)
  async getRankByUserId(@GetCurrentUserInfo() user) {
    const result = await this.ranksService.getUserRank(user["sub"]);
    return result;
  }
  /** -------------------- */

  /** 모든 구별 랭킹 가져오기*/
  @Get("/region")
  @ApiOperation({ summary: "모든 구별 랭킹 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [RegionRanking], 
  })
  async getRanksByAllRegion() {
    const result = await this.ranksService.generateUserRankingByAllRegions();
    return result;
  }
  /** -------------------- */

  /** 구별 랭킹 가져오기 */
  @Get("/region/:id")
  @ApiOperation({ summary: "구별 랭킹 가져오기" })
  @ApiParam({ name: "id", description: "해당 구의 아이디" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [GetManyRanksResponse], 
  })
  async getRanksByRegion(@Param("id", ParseIntPipe) region_id: string) {
    const result = await this.ranksService.generateUserRankingForRegion(
      region_id
    );
    return result.userRanking;
  }
  /** -------------------- */
}
