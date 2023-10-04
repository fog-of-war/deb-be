import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { BadgesService } from "./badges.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("badges")
@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  async getBadgesInfo() {
    return await this.badgesService.getAllBadges();
  }
}
