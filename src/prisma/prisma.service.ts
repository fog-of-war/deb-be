import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

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

    return this.$transaction([this.user.deleteMany(), this.post.deleteMany()]);
  }
}
