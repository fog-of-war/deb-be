import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Inject
} from "@nestjs/common";
import { CreatePostDto, EditPostDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import { PlacesService } from "src/places/places.service";
import { BadgesService } from "src/badges/badges.service";
import { PointsService } from "src/points/points.service";
import { LevelsService } from "src/levels/levels.service";
import { UsersService } from "src/users/users.service";
import { RanksService } from "src/ranks/ranks.service";
import { Prisma } from "@prisma/client";
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { Observable, interval, of, throwError } from 'rxjs';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly placesService: PlacesService,
    private readonly badgesService: BadgesService,
    private readonly pointsService: PointsService,
    private readonly levelsService: LevelsService,
    private readonly usersService: UsersService,
    private readonly ranksService: RanksService,
    @Inject('ALERT') private alertClient: ClientProxy
  ) {}
  /** 여러 개의 게시물 가져오기 */
  async getPosts() {
    const result = await this.prisma.post.findMany({
      where: { post_is_deleted: false },
      include: {
        post_place: true,
        // Include the associated Place information
      },
    });
    return result;
  }

  /** 여러 개의 게시물 가져오기 */
  async getPostsByUserId(userId: number) {
    const result = this.prisma.post.findMany({
      where: { post_author_id: userId, post_is_deleted: false },
      include: {
        post_place: true, // Include the associated Place information
      },
    });
    return result;
  }

  /** 하나의 게시물 가져오기 */
  async getPostById(postId: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        post_id: postId,
        post_is_deleted: false,
      },
      include: {
        post_place: true, // Include the associated Place information
      },
    });

    if (!post) {
      // 게시물을 찾지 못한 경우
      throw new NotFoundException(`Post with id ${postId} not found.`);
    }

    return post;
  }
  /** 게시물 생성 후처리 */
  private async createPostActions(
    userId: number,
    placeId: number
  ):Promise<void>{
    try {
      await this.placesService.createPlaceVisit(userId, placeId);
      await this.placesService.updatePlaceStarRating(placeId);
      await this.pointsService.assignPoints(userId, placeId);
      await this.levelsService.updateLevel(userId);
      await this.badgesService.checkAndAssignBadge(userId);
      await this.ranksService.updateRanks();
      // const pattern = { cmd: 'sum' };
      // const payload = [1, 2, 3];
      // return this.alertClient.send<number>(pattern, payload);
      // const message = await this.alertClient.send({cmd:'greeting-async'}, "Progressive Coder");
      // return message;

    } catch (error) {
      // 각 서비스의 에러를 적절하게 처리할 수 있도록 코드를 추가합니다.
      console.error("Error in createPostActions:", error);
      throw new InternalServerErrorException(
        "Failed to perform post actions.",
        error
      );
    }
  }

  /** 게시물 생성하기 */
  async createPost(userId: number, dto: CreatePostDto): Promise<any> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { user_id: userId, user_is_deleted: false },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      const userStateBefore = await this.usersService.findUserById(userId);
      const existingPlace = await this.findPlaceByCoordinates(dto.place_name);
      let post;
      let placeId;

      if (existingPlace) {
        await this.createPostWithExistingPlace(existingPlace, userId, dto);
        placeId = existingPlace.place_id;
      } else {
        const { place_name, place_latitude, place_longitude } = dto;
        const newPlace = await this.placesService.createPlace(
          place_name,
          place_latitude,
          place_longitude
        );
        await this.createPostWithNewPlace(newPlace, userId, dto);
        placeId = newPlace.place_id;
      }
      // Create PlaceVisit
      await this.createPostActions(userId, placeId);
      const result = await this.compareUserStates(userId, userStateBefore);
      return result;
    } catch (error) {
      if (error) {
        // Prisma에서 발생한 에러 처리
        throw new BadRequestException("게시물 생성 중 오류가 발생했습니다.");
      }
      throw error; // 다른 예외는 그대로 던짐
    }
  }

  private async compareUserStates(
    userId: number,
    userStateBefore: any
  ): Promise<any> {
    try {
      const userStateAfter = await this.usersService.findUserById(userId);
      const state = { new_level: undefined, new_badges: undefined };

      if (userStateAfter.user_level !== userStateBefore.user_level) {
        state.new_level = userStateAfter.user_level;
      }

      state.new_badges = userStateAfter["user_badges"].filter(
        (badgeAfter) =>
          !userStateBefore.user_badges.some(
            (badgeBefore) => badgeBefore.badge_id === badgeAfter.badge_id
          )
      );
      return { state };
    } catch (error) {
      console.error("Error in compareUserStates:", error);
      throw new InternalServerErrorException(
        "Failed to compare user states.",
        error
      );
    }
  }
  private async findPlaceByCoordinates(place_name) {
    return this.prisma.place.findFirst({
      where: {
        place_name: place_name,
      },
    });
  }

  private async createPostWithExistingPlace(
    existingPlace: any,
    userId: number,
    dto: CreatePostDto
  ) {
    return this.prisma.post.create({
      data: {
        post_star_rating: dto.post_star_rating,
        post_description: dto.post_description,
        post_image_url: dto.post_image_url,
        post_place: {
          connect: {
            place_id: existingPlace.place_id,
          },
        },
        post_author: {
          connect: { user_id: userId },
        },
      },
    });
  }

  private async createPostWithNewPlace(
    newPlace: any,
    userId: number,
    dto: CreatePostDto
  ) {
    return this.prisma.post.create({
      data: {
        post_star_rating: dto.post_star_rating,
        post_description: dto.post_description,
        post_image_url: dto.post_image_url,
        post_place: {
          connect: {
            place_id: newPlace.place_id,
          },
        },
        post_author: {
          connect: { user_id: userId },
        },
      },
    });
  }

  /** 게시물 수정하기 */
  async editPostById(userId: number, postId: number, dto: EditPostDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { user_id: userId, user_is_deleted: false },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      const post = await this.prisma.post.findFirst({
        where: {
          post_id: postId,
          post_author_id: userId,
          post_is_deleted: false,
        },
      });

      if (!post) {
        throw new NotFoundException(`Post with id ${postId} not found.`);
      }

      // 수정할 필드들을 업데이트
      const updatedPost = await this.prisma.post.update({
        where: { post_id: postId },
        data: {
          post_star_rating: dto.post_star_rating,
          post_description: dto.post_description,
        },
      });

      return updatedPost;
    } catch (err) {
      throw err;
    }
  }

  // /** 게시물 삭제하기 */
  // async deletePostById(userId: number, postId: number) {
  //   return this.prisma.post.update({
  //     where: {
  //       post_id: postId,
  //       post_author_id: userId,
  //       post_is_deleted: false,
  //     },
  //     data: { post_is_deleted: true },
  //   });
  // }

  // /** 게시물 삭제하기 */
  // async deletePostById(userId: number, postId: number) {
  //   try {
  //     // const user = await this.prisma.user.findFirst({
  //     //   where: { user_id: userId, user_is_deleted: false },
  //     // });
  //     // // console.log(
  //     // //   "🚀 ~ file: posts.service.ts:269 ~ PostsService ~ deletePostById ~ user:",
  //     // //   user
  //     // // );

  //     // if (!user) {
  //     //   throw new UnauthorizedException();
  //     // }

  //     const deletedPost = await this.prisma.post.delete({
  //       where: {
  //         post_id: postId,
  //         post_author_id: userId,
  //       },
  //     });

  //     if (!deletedPost) {
  //       throw new NotFoundException("게시물을 찾을 수 없습니다."); // 404 오류 반환
  //     }

  //     return deletedPost;
  // } catch (error) {
  //   if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //     // Prisma에서 발생한 에러 처리
  //     throw new BadRequestException("게시물 삭제 중 오류가 발생했습니다.");
  //   }
  //   throw error; // 다른 예외는 그대로 던짐
  // }
  // }

  /** 게시물 삭제하기 */
  async deletePostById(userId: number, postId: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { user_id: userId, user_is_deleted: false },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      const deletedPost = await this.prisma.post.delete({
        where: {
          post_id: postId,
          post_author_id: userId,
        },
      });
      if (!deletedPost) {
        throw new NotFoundException("게시물을 찾을 수 없습니다."); // 404 오류 반환
      }
      return deletedPost;
    } catch (error) {}
  }
}
