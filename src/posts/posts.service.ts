import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreatePostDto, EditPostDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import { PlacesService } from "src/places/places.service";
import { BadgesService } from "src/badges/badges.service";
import { PointsService } from "src/points/points.service";
import { LevelsService } from "src/levels/levels.service";

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly placesService: PlacesService,
    private readonly badgesService: BadgesService,
    private readonly pointsService: PointsService,
    private readonly levelsService: LevelsService
  ) {}
  /** 여러 개의 게시물 가져오기 */
  async getPosts() {
    const result = await this.prisma.post.findMany({
      include: {
        post_place: true, // Include the associated Place information
      },
    });
    return result;
  }

  /** 여러 개의 게시물 가져오기 */
  async getPostsByUserId(userId: number) {
    const result = this.prisma.post.findMany({
      where: { post_author_id: userId },
      include: {
        post_place: true, // Include the associated Place information
      },
    });
    return result;
  }

  /** 하나의 게시물 가져오기 */
  async getPostById(userId: number, postId: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        post_id: postId,
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
  private async createPostActions(
    userId: number,
    placeId: number
  ): Promise<void> {
    try {
      await this.placesService.createPlaceVisit(userId, placeId);
      await this.pointsService.assignPoints(userId, placeId);
      await this.levelsService.updateLevel(userId);
      await this.badgesService.checkAndAssignBadge(userId);
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
    const result = await this.createPostActions(userId, placeId);

    return result;
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
    const post = await this.prisma.post.findFirst({
      where: {
        post_id: postId,
        post_author_id: userId,
      },
    });

    if (!post) {
      // 수정하려는 게시물을 찾지 못한 경우
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
  }
  /** 게시물 삭제하기 */
  async deletePostById(userId: number, postId: number) {
    return this.prisma.post.delete({
      where: {
        post_id: postId,
        post_author_id: userId,
      },
    });
  }
}

// import {
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from "@nestjs/common";
// import { CreatePostDto, EditPostDto } from "./dto";
// import { PrismaService } from "../prisma/prisma.service";
// import { PlacesService } from "src/places/places.service";
// import { BadgesService } from "src/badges/badges.service";
// import { PointsService } from "src/points/points.service";
// import { LevelsService } from "src/levels/levels.service";
// import { EventEmitter2 } from "@nestjs/event-emitter";
// import { UsersService } from "src/users/users.service";
// import * as _ from "lodash";

// type UserChanges = {
//   changedUserLevel: boolean;
//   changedUserBadges: boolean;
// };

// @Injectable()
// export class PostsService {
//   constructor(
//     private prisma: PrismaService,
//     private readonly placesService: PlacesService,
//     private readonly badgesService: BadgesService,
//     private readonly pointsService: PointsService,
//     private readonly levelsService: LevelsService,
//     private readonly eventEmitter: EventEmitter2,
//     private readonly usersService: UsersService
//   ) {}

//   async getPosts() {
//     return this.prisma.post.findMany({
//       include: {
//         post_place: true,
//       },
//     });
//   }

//   async getPostsByUserId(userId: number) {
//     return this.prisma.post.findMany({
//       where: { post_author_id: userId },
//       include: {
//         post_place: true,
//       },
//     });
//   }

//   async getPostById(userId: number, postId: number) {
//     const post = await this.findPostById(postId);
//     if (!post) {
//       throw new NotFoundException(`Post with id ${postId} not found.`);
//     }
//     return post;
//   }

//   async createPost(userId: number, dto: CreatePostDto): Promise<UserChanges> {
//     const userStateBefore = await this.usersService.findUserById(userId);
//     const placeId = await this.createOrUpdatePlace(dto);
//     await this.createPostActions(userId, placeId);
//     return await this.compareUserStates(userId, userStateBefore);
//   }

//   async editPostById(userId: number, postId: number, dto: EditPostDto) {
//     const post = await this.findPostById(postId, userId);
//     await this.updatePost(postId, dto);
//     return post;
//   }

//   async deletePostById(userId: number, postId: number) {
//     const post = await this.findPostById(postId, userId);
//     return this.prisma.post.delete({
//       where: {
//         post_id: postId,
//         post_author_id: userId,
//       },
//     });
//   }

//   private async findPostById(postId: number, userId?: number) {
//     try {
//       const post = await this.prisma.post.findFirst({
//         where: {
//           post_id: postId,
//           ...(userId && { post_author_id: userId }),
//         },
//         include: {
//           post_place: true,
//         },
//       });
//       return post;
//     } catch (error) {
//       console.error("Error in findPostById:", error);
//       throw new InternalServerErrorException(
//         "Failed to find post by id.",
//         error
//       );
//     }
//   }

//   // private async createOrUpdatePlace(dto: CreatePostDto): Promise<any> {
//   //   try {
//   //     let post;
//   //     let placeId;
//   //     const existingPlace = await this.findPlaceByCoordinates(dto.place_name);
//   //     if (existingPlace) {
//   //       post = await this.createPostWithExistingPlace(
//   //         existingPlace,
//   //         userId,
//   //         dto
//   //       );
//   //       placeId = existingPlace.place_id;
//   //     } else {
//   //       const newPlace = await this.placesService.createPlace(
//   //         dto.place_name,
//   //         dto.place_latitude,
//   //         dto.place_longitude
//   //       );
//   //       post = await this.createPostWithNewPlace(newPlace, userId, dto);
//   //       placeId = newPlace.place_id;
//   //     }
//   //   } catch (error) {
//   //     console.error("Error in createOrUpdatePlace:", error);
//   //     throw new InternalServerErrorException(
//   //       "Failed to create or update place.",
//   //       error
//   //     );
//   //   }
//   // }
//   /** 게시물 생성하기 */
//   async createPost(userId: number, dto: CreatePostDto): Promise<any> {
//     const existingPlace = await this.findPlaceByCoordinates(dto.place_name);
//     let post;
//     let placeId;
//     if (existingPlace) {
//       post = await this.createPostWithExistingPlace(existingPlace, userId, dto);
//       placeId = existingPlace.place_id;
//     } else {
//       const { place_name, place_latitude, place_longitude } = dto;
//       const newPlace = await this.placesService.createPlace(
//         place_name,
//         place_latitude,
//         place_longitude
//       );
//       post = await this.createPostWithNewPlace(newPlace, userId, dto);
//       placeId = newPlace.place_id;
//     }
//     // Create PlaceVisit
//     createPostActions();
//   }
//   private async findPlaceByCoordinates(place_name) {
//     return this.prisma.place.findFirst({
//       where: {
//         place_name: place_name,
//       },
//     });
//   }
//   private async createPostWithExistingPlace(
//     existingPlace: any,
//     userId: number,
//     dto: CreatePostDto
//   ) {
//     return this.prisma.post.create({
//       data: {
//         post_star_rating: dto.post_star_rating,
//         post_description: dto.post_description,
//         post_image_url: dto.post_image_url,
//         post_place: {
//           connect: {
//             place_id: existingPlace.place_id,
//           },
//         },
//         post_author: {
//           connect: { user_id: userId },
//         },
//       },
//     });
//   }
//   private async createPostWithNewPlace(
//     newPlace: any,
//     userId: number,
//     dto: CreatePostDto
//   ) {
//     return this.prisma.post.create({
//       data: {
//         post_star_rating: dto.post_star_rating,
//         post_description: dto.post_description,
//         post_image_url: dto.post_image_url,
//         post_place: {
//           connect: {
//             place_id: newPlace.place_id,
//           },
//         },
//         post_author: {
//           connect: { user_id: userId },
//         },
//       },
//     });
//   }

//   private async createPostActions(
//     userId: number,
//     placeId: number
//   ): Promise<void> {
//     try {
//       await this.placesService.createPlaceVisit(userId, placeId);
//       await this.usersService.addAuthoredPost(userId, postId);
//       await this.pointsService.assignPoints(userId, placeId);
//       await this.levelsService.updateLevel(userId);
//       await this.badgesService.checkAndAssignBadge(userId);
//     } catch (error) {
//       // 각 서비스의 에러를 적절하게 처리할 수 있도록 코드를 추가합니다.
//       console.error("Error in createPostActions:", error);
//       throw new InternalServerErrorException(
//         "Failed to perform post actions.",
//         error
//       );
//     }
//   }
//   // private async createPostWithExistingPlace(
//   //   existingPlace: any,
//   //   userId: number,
//   //   dto: CreatePostDto
//   // ) {
//   //   return this.prisma.post.create({
//   //     data: {
//   //       post_star_rating: dto.post_star_rating,
//   //       post_description: dto.post_description,
//   //       post_image_url: dto.post_image_url,
//   //       post_place: {
//   //         connect: {
//   //           place_id: existingPlace.place_id,
//   //         },
//   //       },
//   //       post_author: {
//   //         connect: { user_id: userId },
//   //       },
//   //     },
//   //   });
//   // }
//   // private async createPostWithNewPlace(
//   //   newPlace: any,
//   //   userId: number,
//   //   dto: CreatePostDto
//   // ) {
//   //   return this.prisma.post.create({
//   //     data: {
//   //       post_star_rating: dto.post_star_rating,
//   //       post_description: dto.post_description,
//   //       post_image_url: dto.post_image_url,
//   //       post_place: {
//   //         connect: {
//   //           place_id: newPlace.place_id,
//   //         },
//   //       },
//   //       post_author: {
//   //         connect: { user_id: userId },
//   //       },
//   //     },
//   //   });
//   // }
//   private async compareUserStates(
//     userId: number,
//     userStateBefore: any
//   ): Promise<any> {
//     try {
//       const userStateAfter = await this.usersService.findUserById(userId);
//       console.log(
//         "🚀 ~ file: posts.service.ts:147 ~ userStateBefore:",
//         userStateBefore
//       );

//       console.log(
//         "🚀 ~ file: posts.service.ts:147 ~ userStateBefore:",
//         userStateAfter
//       );
//       const state = { new_level: undefined, new_badges: undefined };

//       if (userStateAfter.user_level !== userStateBefore.user_level) {
//         state.new_level = userStateAfter.user_level;
//       }

//       state.new_badges = userStateAfter["user_badges"].filter(
//         (badgeAfter) =>
//           !userStateBefore.user_badges.some(
//             (badgeBefore) => badgeBefore.badge_id === badgeAfter.badge_id
//           )
//       );
//       return { state };
//     } catch (error) {
//       console.error("Error in compareUserStates:", error);
//       throw new InternalServerErrorException(
//         "Failed to compare user states.",
//         error
//       );
//     }
//   }

//   private async updatePost(postId: number, dto: EditPostDto) {
//     await this.prisma.post.update({
//       where: { post_id: postId },
//       data: {
//         post_star_rating: dto.post_star_rating,
//         post_description: dto.post_description,
//       },
//     });
//   }

//   private async findPlaceByCoordinates(place_name) {
//     return this.prisma.place.findFirst({
//       where: {
//         place_name: place_name,
//       },
//     });
//   }
// }
