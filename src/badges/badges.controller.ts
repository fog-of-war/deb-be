import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseInterceptors,
} from "@nestjs/common";
import { BadgesService } from "./badges.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { BadgeResponse } from "./response";
import { UserSubCheckInterceptor } from "src/common/interceptor";

@ApiTags("badges")
@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}
  /** 뱃지 목록에서 사용할 전체 뱃지 정보 전달*/

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "뱃지 목록에서 사용할 전체 뱃지 정보 전달",
    type: [BadgeResponse], 
  })
  @Get()
  async getBadgesInfo() {
    return await this.badgesService.getAllBadges();
  }
  /** -------------------- */
}
