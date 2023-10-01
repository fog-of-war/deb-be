import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /** 카테고리 확인 시 사용 */
  async findCategoryName(category_id) {
    const result = await this.prisma.category.findFirst({
      where: { category_id: category_id },
    });
    return result;
  }
  /** -------------------- */
}
