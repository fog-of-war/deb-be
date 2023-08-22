import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { validate } from "class-validator";
@ApiTags("users")
@UseGuards(JwtGuard)
@Controller("users")
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get("me")
  @ApiBearerAuth("access_token")
  async getMe(@GetUser() user: User) {
    const result = await this.userService.leanUserInfo(user);
    return result;
  }

  @Patch("me")
  @ApiBearerAuth("access_token")
  @HttpCode(201)
  async editUser(@GetUser("user_id") userId: number, @Body() dto: EditUserDto) {
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
      const result = await this.userService.editUser(userId, dto);
      return { message: "유저 정보 변경에 성공했습니다" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
