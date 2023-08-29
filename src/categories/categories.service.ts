import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  async init() {
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

    await this.prisma.category.createMany({
      data: categories,
      skipDuplicates: true,
    });
    return "This action adds a new category";
  }

}
