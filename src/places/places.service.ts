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
  /**
   *
   *
   */
  async findPlacesInfoForJH(query: string): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/search/keyword`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        radius: 20000,
        query: query,
      },
    };
    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      // Filter out results with "커피" as the place name only when the query includes "맛집"
      const filteredResults = response.data.documents.filter(
        (document: any) => {
          if (query.includes("맛집")) {
            return document.place_name !== "커피";
          }
          return true;
        }
      );
      const result = await this.areTheyExistInDB(filteredResults);
      return result;
    } catch (error) {
      throw new Error(
        `findPlacesInfoFromKakao: 카카오에서 해당 장소 검색 실패`
      );
    }
  }
  /**
   *
   *
   */
  async findPlacesInfoFromKakao(x: any, y: any, query: string): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/search/keyword`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        x: x, //longitude
        y: y, //latitude
        radius: 20000,
        query: query,
      },
    };
    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      // Filter out results with "커피" as the place name only when the query includes "맛집"
      const filteredResults = response.data.documents.filter(
        (document: any) => {
          if (query.includes("맛집")) {
            return document.place_name !== "커피";
          }
          return true;
        }
      );
      const result = await this.areTheyExistInDB(filteredResults);
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
        radius: 20000,
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
  /**
   *
   *
   */
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
  /**
   *
   *
   */
  extractGu(place_address: string) {
    const array = place_address.split(" ");

    if (array.length >= 2 && array[1].match(/구$/)) {
      return array[1];
    }

    // 추출 실패 시 에러 메시지 반환
    throw new Error("구 이름을 추출할 수 없습니다.");
  }
  /**
   *
   *
   */
  addAddress(payload: any): string {
    try {
      return payload.road_address_name || payload.address_name || "";
    } catch (error) {
      const errorMessage = `addAddress 에러: ${error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage); // 에러 발생 시 에러를 내보냅니다.
    }
  }
  /**
   *
   *
   */
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
  /**
   *
   *
   */
  async createPlace(
    place_name: string,
    place_latitude: number,
    place_longitude: number
  ) {
    try {
      const { response, place_address, place_category } =
        await this.findPlaceInfoFromKakao(
          place_name,
          place_latitude, // 위도 y
          place_longitude // 위도 x
        );

      await this.checkQueryInResponsePlaces(response, place_name);
      const gu = this.extractGu(place_address);

      const region = await this.prisma.region.findFirst({
        where: { region_name: gu },
      });

      const createdPlace = await this.prisma.place.create({
        data: {
          place_name: place_name,
          place_latitude: place_latitude,
          place_longitude: place_longitude,
          place_address: place_address,
          place_region_id: region.region_id,
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
  /**
   *
   *
   */
  async getAll() {
    const result = await this.prisma.place.findMany({});
    return result;
  }
  /**
   *
   *
   */
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
        place_region: true,
      },
    });
    return result;
  }
  /**
   *
   *
   */
  async createPlaceVisit(userId: number, placeId: number) {
    await this.prisma.placeVisit.create({
      data: {
        visited_user: { connect: { user_id: userId } },
        visited_place: { connect: { place_id: placeId } },
      },
    });
  }
  /**
   *
   *
   */
  async getPlacePosts(placeId: number) {
    const place = await this.prisma.place.findFirst({
      where: { place_id: placeId },
      select: { place_id: true, place_name: true, place_star_rating: true },
    });
    place.place_star_rating = 4.5;
    const posts = await this.prisma.post.findMany({
      where: { post_place_id: placeId },
      select: {
        post_id: true,
        post_created_at: true,
        post_updated_at: true,
        post_description: true,
        post_image_url: true,
        post_author_id: true,
        post_star_rating: true,
      },
    });

    const postsWithUserInfo = [];

    for (const post of posts) {
      const user = await this.prisma.user.findUnique({
        where: { user_id: post.post_author_id },
        select: {
          user_id: true,
          user_nickname: true,
          user_image_url: true,
        },
      });

      postsWithUserInfo.push({
        ...post,
        post_author: user,
      });
    }

    const newPlace = { ...place, place_posts: postsWithUserInfo };
    return newPlace; // 반환 타입 수정
  }
  /**
   *
   *
   */
  async getLandmarks() {
    const places = await this.prisma.mapPlaceCategory.findMany({
      where: {
        categoryId: 7,
      },
    });

    const result = await Promise.all(
      places.map(async (place) => {
        const foundPlace = await this.prisma.place.findFirst({
          where: {
            place_id: place.placeId,
          },
          include: { place_posts: true },
        });
        return foundPlace;
      })
    );
    return result;
  }
}
