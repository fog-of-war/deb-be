import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import * as placesData from "./landmarks.json";
import * as badges from "./badges.json";
import * as categories from "./categories.json";
import * as levels from "./levels.json";
import * as regions from "./regions.json";
import * as posts from "./posts.json";
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get("DATABASE_URL"),
        },
      },
    });
  }

  async cleanDb() {
    try {
      await this.$transaction(async () => {
        // 카테고리 생성 작업
        await this.category.createMany({
          data: categories,
          skipDuplicates: true,
        });

        // 구 삽입 작업
        await this.insertRegion();

        // 장소 삽입 작업
        await this.insertPlaces();

        // 뱃지 삽입 작업
        await this.insertBadges();

        // 레벨 삽입 작업
        await this.insertLevels();
      });
    } catch (error) {
      // 트랜잭션 내에서 오류가 발생한 경우 처리
      console.error("An error occurred during database cleanup:", error);
    }
  }

  async insertRegion() {
    const regionData = regions as Array<any>; // JSON 파일을 배열로 변환
    for (const region of regionData) {
      // 데이터베이스에 해당 뱃지 이름이 있는지 확인
      const existingRegion = await this.region.findFirst({
        where: { region_name: region.region_name },
      });

      if (!existingRegion) {
        await this.region.create({
          data: {
            region_name: region.region_name,
          },
        });
      }
    }
  }

  extractGu(place_address: string) {
    const array = place_address.split(" ");

    if (array.length >= 2 && array[1].match(/구$/)) {
      return array[1];
    }

    // 추출 실패 시 에러 메시지 반환
    throw new Error("구 이름을 추출할 수 없습니다.");
  }

  async insertPlaces() {
    for (const placeData of placesData) {
      const existingPlace = await this.place.findFirst({
        where: { place_name: placeData.place_name },
      });

      if (!existingPlace) {
        const categories = await this.category.findMany({
          where: { category_id: { in: placeData.place_category_ids } },
        });
        console.log(
          "🚀 ~ file: prisma.service.ts:92 ~ PrismaService ~ insertPlaces ~ placeData.place_address:",
          placeData.place_address
        );

        const gu = this.extractGu(placeData.place_address);
        const region = await this.region.findFirst({
          where: { region_name: gu },
        });
        const createdPlace = await this.place.create({
          data: {
            place_name: placeData.place_name,
            place_address: placeData.place_address,
            place_latitude: placeData.place_latitude,
            place_longitude: placeData.place_longitude,
            place_region_id: region.region_id,
            place_category_map: {
              create: categories.map((category) => ({
                category: { connect: { category_id: category.category_id } },
              })),
            },
          },
        });
        console.log("Created place:", createdPlace);
      }
    }
  }

  async insertBadges() {
    const badgeData = badges as Array<any>; // JSON 파일을 배열로 변환
    for (const badge of badgeData) {
      // 데이터베이스에 해당 뱃지 이름이 있는지 확인
      const existingBadge = await this.badge.findFirst({
        where: { badge_name: badge.badge_name },
      });

      if (!existingBadge) {
        await this.badge.create({
          data: {
            badge_name: badge.badge_name,
            badge_criteria: badge.badge_criteria,
            badge_category_id: badge.badge_category_id,
            badge_image_url: badge.badge_image_url,
          },
        });
      }
    }
  }

  async insertLevels() {
    const levelData = levels as Array<any>; // JSON 파일을 배열로 변환
    for (const level of levelData) {
      // 데이터베이스에 해당 뱃지 이름이 있는지 확인
      const existinglevel = await this.level.findFirst({
        where: { level_level: level.level_level },
      });

      if (!existinglevel) {
        await this.level.create({
          data: {
            level_level: level.level_level,
            level_points: level.level_points,
            level_description: level.level_description,
          },
        });
      }
    }

  }
}
