import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePostDto, EditPostDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}
  /** 여러 개의 게시물 가져오기 */
  async getPosts() {
    return this.prisma.post.findMany();
  }

  /** 여러 개의 게시물 가져오기 */
  async getPostsByUserId(userId: number) {
    const result = this.prisma.post.findMany({
      where: { post_author_id: userId },
    });

    console.log(result);
    return result;
  }

  /** 하나의 게시물 가져오기 */
  async getPostById(userId: number, postId: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        post_id: postId,
      },
    });

    if (!post) {
      // 게시물을 찾지 못한 경우
      throw new NotFoundException(`Post with id ${postId} not found.`);
    }

    return post;
  }

  /** 게시물 생성하기 */
  // async createPost(userId: number, dto: CreatePostDto) {
  //   console.log("hi");
  //   const existingPlace = await this.prisma.place.findFirst({
  //     where: {
  //       place_latitude: dto.latitude,
  //       place_longitude: dto.longitude,
  //     },
  //   });
  //   let post;
  //   if (existingPlace) {
  //     post = await this.prisma.post.create({
  //       data: {
  //         post_star_rating: dto.star_rating,
  //         post_description: dto.description,
  //         post_image_url: dto.image_url,
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
  //   } else {
  //     const newPlace = await this.prisma.place.create({
  //       data: {
  //         place_name: "fake matzip",
  //         place_latitude: dto.latitude,
  //         place_longitude: dto.longitude,
  //         place_category_id: 1,
  //         // 다른 필요한 장소 정보도 추가하세요.
  //       },
  //     });
  //     post = await this.prisma.post.create({
  //       data: {
  //         post_star_rating: dto.star_rating,
  //         post_description: dto.description,
  //         post_image_url: dto.image_url,
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
  //   return post;
  // }
  async createPost(userId: number, dto: CreatePostDto): Promise<any> {
    const existingPlace = await this.findPlaceByCoordinates(
      dto.latitude,
      dto.longitude
    );
    let post;
    if (existingPlace) {
      post = await this.createPostWithExistingPlace(existingPlace, userId, dto);
    } else {
      const newPlace = await this.createPlace(dto.latitude, dto.longitude);
      post = await this.createPostWithNewPlace(newPlace, userId, dto);
    }
    return post;
  }

  private async findPlaceByCoordinates(latitude: number, longitude: number) {
    return this.prisma.place.findFirst({
      where: {
        place_latitude: latitude,
        place_longitude: longitude,
      },
    });
  }

  private async createPlace(latitude: number, longitude: number) {
    return this.prisma.place.create({
      data: {
        place_name: "fake matzip",
        place_latitude: latitude,
        place_longitude: longitude,
        place_category_id: 1,
        // 다른 필요한 장소 정보도 추가하세요.
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
        post_star_rating: dto.star_rating,
        post_description: dto.description,
        post_image_url: dto.image_url,
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
        post_star_rating: dto.star_rating,
        post_description: dto.description,
        post_image_url: dto.image_url,
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
        post_star_rating: dto.star_rating,
        post_description: dto.description,
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
