import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PlacesService {
  private readonly clientID: string;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.clientID = this.config.get("KAKAO_CLIENT_ID");
  }

  async findPlaceInfoFromKakao(query: any, x: any, y: any): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/search/keyword`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        y: y,
        x: x,
        query: query,
        radius: 100,
        size: 1,
      },
    };
    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      const place_address = this.addAddress(response.data.documents[0]);
      const place_category = this.setCategory(response.data.documents[0]);
      return {
        response: response.data,
        place_address: place_address,
        place_category: place_category,
      };
    } catch (error) {
      throw new Error(`findPlaceInfoFromKakao: 카카오에서 해당 장소 검색 실패`);
    }
  }

  checkQueryInResponsePlaces(response: any, query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const isQueryIncluded = response.documents.some((doc) =>
        doc.place_name.includes(query)
      );

      const isMetaKeywordIncluded =
        response.meta.same_name.keyword.includes(query);

      if (isQueryIncluded || isMetaKeywordIncluded) {
        // console.log(`"${query}" 문자열이 응답 데이터 안에 포함되어 있습니다.`);
        resolve(response);
      } else {
        const errorMessage = `checkQueryInResponsePlaces: "${query}" 문자열이 응답 데이터 안에 포함되어 있지 않습니다.`;
        console.error(errorMessage);
        reject(new Error(errorMessage)); // 에러 발생 시 에러를 내보냅니다.
      }
    });
  }

  addAddress(payload: any): string {
    try {
      return payload.road_address_name || payload.address_name || "";
    } catch (error) {
      const errorMessage = `addAddress 에러: ${error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage); // 에러 발생 시 에러를 내보냅니다.
    }
  }
  setCategory(payload: any): number | undefined {
    try {
      const categoryMappings = {
        음식점: 1,
        "스포츠,레저": 2,
        미술관: 3,
        문화유적: 4,
        기념관: 4,
        전시관: 4,
        카페: 5,
        // ... 여기에 추가적인 카테고리와 매핑을 추가할 수 있습니다.
      };
      for (const category of Object.keys(categoryMappings)) {
        if (payload.category_name.includes(category)) {
          return categoryMappings[category];
        }
      }
      return 6; // 매핑이 없는 경우 undefined 반환
    } catch (error) {
      console.error("setCategory 에러:", error);
      return undefined; // 에러 발생 시 undefined 반환
    }
  }

  async createPlace(
    place_name: string,
    place_latitude: number,
    place_longitude: number
  ) {
    let createdPlace;
    try {
      const { response, place_address, place_category } =
        await this.findPlaceInfoFromKakao(
          place_name,
          place_latitude,
          place_longitude
        );
      await this.checkQueryInResponsePlaces(response, place_name);
      const data = {
        place_name: place_name,
        place_latitude: place_latitude,
        place_longitude: place_longitude,
        place_address: place_address,
        place_category: {
          connect: { category_id: place_category | 6 }, // If category is not found, default to 6(기본)
        },
      };
      createdPlace = await this.prisma.place.create({
        data: data,
      });
      // console.log(createdPlace);
      if (!createdPlace) {
        throw new Error(
          `createPlace: 장소 생성 실패 - 데이터베이스에 새 장소가 생성되지 않았습니다.`
        );
      }
      // console.log(createdPlace);
      return createdPlace;
    } catch (error) {
      throw new Error(`createPlace: 장소 생성 실패 - ${error.message}`);
    }
  }

  async getAll() {
    const result = await this.prisma.place.findMany({});
    // console.log(result);
    return result;
  }
  async getOne(placeId: number) {
    const result = await this.prisma.place.findFirst({
      where: { place_id: placeId },
      include: {
        place_posts: true, // Include related posts
        place_category_map: {
          include: {
            category: true, // Include related category with its name
          },
        },
        place_visited_by: true,
      },
    });
    return result;
  }
}
