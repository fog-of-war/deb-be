import { Injectable } from "@nestjs/common";
import { CreatePointDto } from "./dto/create-point.dto";
import { UpdatePointDto } from "./dto/update-point.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}
  async assignPoints(userId: number, placeId: number): Promise<void> {
    const points = [];
    const place = await this.prisma.place.findUnique({
      where: { place_id: placeId },
      include: {
        place_category_map: {
          include: { category: true },
        },
      },
    });
    points.push(place.place_points);
    place.place_category_map.forEach((item) => {
      points.push(item.category.category_points);
    });

    console.log(
      "🚀 ~ file: points.service.ts:13 ~ PointsService ~ assginPoints ~ place:",
      points
    );

    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    // 포인트 합산하여 user.user_points 업데이트
    const totalPoints = points.reduce(
      (sum, current) => sum + (current || 0),
      0
    );
    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: { user_points: user.user_points + totalPoints },
    });
    console.log(
      "🚀 ~ file: points.service.ts:42 ~ PointsService ~ assignPoints ~ updatedUser:",
      updatedUser
    );
  }
}
