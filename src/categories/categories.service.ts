import { Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
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

  findAll() {
    return `This action returns all categories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
