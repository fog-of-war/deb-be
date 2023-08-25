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
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { validate } from "class-validator";
import { EditUserResponse, GetUserResponse } from "./responses";

@ApiTags("users")
@UseGuards(JwtGuard)
@Controller("users")
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get("me")
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "",
    type: GetUserResponse, // 반환 모델을 지정
  })
  async getMe(@GetUser() user: User) {
    const result = await this.userService.leanUserInfo(user);
    return result;
  }

  @Patch("me")
  @ApiBearerAuth("access_token")
  @HttpCode(201)
  @ApiResponse({
    status: 200,
    description: "",
    type: EditUserResponse, // 이 부분 수정
  })
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
      await this.userService.editUser(userId, dto);
      return { message: "유저 정보 변경에 성공했습니다" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
