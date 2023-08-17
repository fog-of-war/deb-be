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
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch("me")
  async editUser(@GetUser("user_id") userId: number, @Body() dto: EditUserDto) {
    // 유효성 검사 수행
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new UnprocessableEntityException(errors);
    }
    try {
      const result = await this.userService.editUser(userId, dto);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
