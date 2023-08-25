import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePostDto, EditPostDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import { PlacesService } from "src/places/places.service";
import { BadgesService } from "src/badges/badges.service";
import { PointsService } from "src/points/points.service";

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly placesService: PlacesService,
    private readonly badgesService: BadgesService,
    private readonly pointsService: PointsService
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
  /** 게시물 생성하기 */
  async createPost(userId: number, dto: CreatePostDto): Promise<any> {
    const existingPlace = await this.findPlaceByCoordinates(dto.place_name);
    let post;
    let placeId;

    if (existingPlace) {
      post = await this.createPostWithExistingPlace(existingPlace, userId, dto);
      placeId = existingPlace.place_id;
    } else {
      const { place_name, place_latitude, place_longitude } = dto;
      const newPlace = await this.placesService.createPlace(
        place_name,
        place_latitude,
        place_longitude
      );
      post = await this.createPostWithNewPlace(newPlace, userId, dto);
      placeId = newPlace.place_id;
    }
    // Create PlaceVisit
    await this.placesService.createPlaceVisit(userId, placeId);
    await this.pointsService.assignPoints(userId, placeId);
    const result = await this.badgesService.checkAndAssignBadge(userId);

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
