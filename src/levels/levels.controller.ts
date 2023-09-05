import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { LevelsService } from "./levels.service";

@Controller("levels")
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}
}
