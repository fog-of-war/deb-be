import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import * as placesData from "./landmarks.json";
import * as badges from "./badges.json";
import * as categories from "./categories.json";
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
    // 데이터베이스를 초기화

    await this.category.createMany({
      data: categories,
      skipDuplicates: true,
    });
    await this.insertPlaces();
    await this.insertBadges();
    return this.$transaction([]);
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

        const createdPlace = await this.place.create({
          data: {
            place_name: placeData.place_name,
            place_address: placeData.place_address,
            place_latitude: placeData.place_latitude,
            place_longitude: placeData.place_longitude,
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
          },
        });
      }
    }
  }
}
