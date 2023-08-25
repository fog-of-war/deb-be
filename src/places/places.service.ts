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

  async findPlacesInfoFromKakao(query: string, x: any, y: any): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/search/keyword`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        x: x,
        y: y,
        query: query,
      },
    };
    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      const result = await this.areTheyExistInDB(response.data.documents);
      return result;
    } catch (error) {
      throw new Error(
        `findPlacesInfoFromKakao: 카카오에서 해당 장소 검색 실패`
      );
    }
  }

  async areTheyExistInDB(payload: any) {
    const promises = payload.map(async (data) => {
      const result = await this.prisma.place.findFirst({
        where: { place_name: data.place_name },
        include: {
          place_posts: true,
          place_category_map: {
            include: {
              category: true, // Include related category with its name
            },
          },
        },
      });
      if (result) {
        data.place_posts = result.place_posts;
        data.place_star_rating = result.place_star_rating;
        data.place_category_map = result.place_category_map;
      }
      return data; // 수정: 각 작업의 결과 반환
    });

    const results = await Promise.all(promises);
    return results; // 모든 작업의 결과 반환
  }

  async findPlaceInfoFromKakao(query: string, x: any, y: any): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/search/keyword`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        x: x,
        y: y,
        query: query,
        radius: 100,
        size: 3,
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

  setCategory(payload: any): any | undefined {
    const categoryArray = [{ categoryId: 1 }];
    const categoryMappings = {
      음식점: 2,
      "스포츠,레저": 3,
      미술관: 4,
      문화유적: 5,
      기념관: 5,
      전시관: 5,
      카페: 6,
      // ... 여기에 추가적인 카테고리와 매핑을 추가할 수 있습니다.
    };
    for (const category of Object.keys(categoryMappings)) {
      if (payload.category_name.includes(category)) {
        categoryArray.push({ categoryId: categoryMappings[category] });
      }
    }
    return categoryArray; // 매핑이 없는 경우 undefined 반환
  }

  async createPlace(
    place_name: string,
    place_latitude: number,
    place_longitude: number
  ) {
    try {
      const { response, place_address, place_category } =
        await this.findPlaceInfoFromKakao(
          place_name,
          place_latitude,
          place_longitude
        );

      await this.checkQueryInResponsePlaces(response, place_name);

      const createdPlace = await this.prisma.place.create({
        data: {
          place_name: place_name,
          place_latitude: place_latitude,
          place_longitude: place_longitude,
          place_address: place_address,
        },
      });

      const createdPlaceId = createdPlace.place_id; // 새로 생성된 장소의 ID
      const placeCategoryMapData = place_category.map((category) => {
        return {
          placeId: createdPlaceId,
          categoryId: category.categoryId,
        };
      });
      try {
        const createManyResult = await this.prisma.mapPlaceCategory.createMany({
          data: placeCategoryMapData,
        });
        console.log("createManyResult:", createManyResult);
      } catch (error) {
        console.error("createManyError:", error);
      }

      return createdPlace;
    } catch (error) {
      throw new Error(`createPlace: 장소 생성 실패 - ${error.message}`);
    }
  }

  async getAll() {
    const result = await this.prisma.place.findMany({});
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
