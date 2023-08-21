import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import * as placesData from "./landmarks.json";

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
    const categories = [
      { category_name: "미식", category_score: 0 },
      { category_name: "운동", category_score: 0 },
      { category_name: "미술관", category_score: 0 },
      { category_name: "역사", category_score: 0 },
      { category_name: "커피", category_score: 0 },
      { category_name: "기본", category_score: 0 },
      { category_name: "랜드마크", category_score: 0 },
      { category_name: "협찬", category_score: 0 },
    ];

    await this.category.createMany({
      data: categories,
      skipDuplicates: true,
    });
    await this.insertPlaces();
    return this.$transaction([]);
  }

  async insertPlaces() {
    for (const placeName in placesData) {
      const placeData = placesData[placeName];

      await this.place.create({
        data: {
          place_name: placeData.place_name,
          place_address: placeData.place_address,
          place_latitude: placeData.place_latitude,
          place_longitude: placeData.place_longitude,
          place_category: {
            connect: { category_id: placeData.place_category_id },
          },
        },
      });
    }
  }
}
