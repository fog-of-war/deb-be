import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { UsersService } from "./users.service";
import { EditUserDto } from "./dto";
import { ApiTags } from "@nestjs/swagger";
import { validate } from "class-validator";
@ApiTags("users")
@UseGuards(JwtGuard)
@Controller("users")
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get("me")
  async getMe(@GetUser() user: User) {
    const result = await this.userService.leanUserInfo(user);
    return result;
  }

  @Patch("me")
  async editUser(@Body() dto: EditUserDto) {
    // 유효성 검사 수행
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorResponse = {
        message: "Validation failed",
        errors: errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints).join(", "),
        })),
      };
      throw new UnprocessableEntityException(errorResponse);
    }
    try {
      // editUser 로직 실행
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
