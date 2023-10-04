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

@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  async getBadgesInfo() {
    return await this.badgesService.getAllBadges();
  }
}
