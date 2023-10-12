import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";
import { PrismaService } from "../prisma/prisma.service";
import { CategoriesService } from "src/categories/categories.service";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class PlacesService {
  private readonly clientID: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
    private logger: LoggerService
  ) {
    this.clientID = this.config.get("KAKAO_CLIENT_ID");
  }

  /** 카카오 API 로 장소 가져오기 */
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
      const filteredResults = response.data.documents.filter(
        (document: any) => {
          if (query.includes("맛집")) {
            return document.place_name !== "커피";
          }
          return true;
        }
      );
      const result = await this.areTheyExistInDB(filteredResults);
      await this.processItems(result);
      return result;
    } catch (error) {
      throw new Error(
        `findPlacesInfoFromKakao: 카카오에서 해당 장소 검색 실패`
      );
    }
  }
  /** -------------------- */

  /** 간단한 쿼리로 장소 검색하기 */
  async findSimplePlacesInfo(query: string): Promise<any> {
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
  /** -------------------- */

  /** 장소를 전장의 안개 데이터 베이스에 넣기 전, 최신 정보 확인 위한 api 요청 */
  async checkPlaceInformation(query: string, x: any, y: any): Promise<any> {
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
      const place_category = this.setCategoryId(response.data.documents[0]);
      return {
        response: response.data,
        place_address: place_address,
        place_category: place_category,
      };
    } catch (error) {
      throw new Error(`checkPlaceInformation: 카카오에서 해당 장소 검색 실패`);
    }
  }
  /** -------------------- */

  /**
   * 카카오 api 로 검색한 결과 가공
   *
   * 1. naver 지도 url 추가
   * 2. 카테고리 매핑
   * */
  async processItems(items) {
    try {
      for (const item of items) {
        item.naver_place_url =
          "https://map.naver.com/p/search/" + item.place_name;

        if (item.place_category_map.length == 0) {
          const categoryIdArray = this.setCategoryId(item);
          // categoryId 배열의 각 요소에 대해 비동기적으로 처리
          const categoryPromises = categoryIdArray.map(
            async (categoryIdItem) => {
              const category = await this.categoriesService.findCategoryName(
                categoryIdItem.categoryId
              );
              item.place_category_map.push(category);
            }
          );
          await Promise.all(categoryPromises);
        }
      }
    } catch (error) {
      this.logger.error("Error in processItems:", error);
    }
  }
  /** -------------------- */

  /** 카카오 api 로 검색한 장소들이 전장의 안개 데이터베이스에 있는지 확인 */
  async areTheyExistInDB(payload: any) {
    const promises = payload.map(async (data) => {
      const result = await this.prisma.place.findFirst({
        where: { place_name: data.place_name },
        include: {
          place_posts: true,
        },
      });
      if (result) {
        data.place_posts = result.place_posts;
        data.place_star_rating = result.place_star_rating;
        /** 이 부분 확인 필요 */
        data.place_category_map = [];
      } else {
        data.place_posts = [];
        data.place_star_rating = null;
        data.place_category_map = [];
      }
      return data;
    });
    const results = await Promise.all(promises);
    return results;
  }
  /** -------------------- */

  /**
   *
   * db에 장소 생성시 정확한 장소 정보 확인 위한 response.meta.same_name 확인
   * 참조 : https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword-response-body-meta
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
        this.logger.error(errorMessage);
        reject(new Error(errorMessage)); // 에러 발생 시 에러를 내보냅니다.
      }
    });
  }
  /** -------------------- */

  /**
   *
   *  장소 주소에서 "구" 추출
   *  ex ) 구로구, 중구
   */
  extractGu(place_address: string) {
    try {
      const array = place_address.split(" ");
      if (array.length >= 2 && array[1].match(/구$/)) {
        return array[1];
      } else {
        return "기타";
      }
    } catch (err) {
      this.logger.error(err);
      throw new Error("구 이름을 추출할 수 없습니다.");
    }
  }
  /** -------------------- */

  /**
   * 장소에 주소 추가시 도로명, 지번 모두 체크하는 메서드
   * 카카오 api 응답 중 도로명주소와 지번주소 중 1가지 만 있는 경우 오류 발생 확인
   */
  addAddress(payload: any): string {
    try {
      return payload.road_address_name || payload.address_name || "";
    } catch (error) {
      const errorMessage = `addAddress 에러: ${error.message}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage); // 에러 발생 시 에러를 내보냅니다.
    }
  }
  /** -------------------- */

  /** 카테고리를 지정하는 메서드 */
  setCategoryId(payload: any): any | undefined {
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

  /** -------------------- */

  /** 장소를 생성하는 메서드 */
  async createPlace(
    place_name: string,
    place_latitude: number,
    place_longitude: number
  ) {
    try {
      const { response, place_address, place_category } =
        await this.checkPlaceInformation(
          place_name,
          place_latitude, // 위도 y latitude
          place_longitude // 경도 x longitude
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
        this.logger.log("createManyResult:", createManyResult);
      } catch (error) {
        this.logger.error("createManyError:", error);
      }

      return createdPlace;
    } catch (error) {
      throw new Error(`createPlace: 장소 생성 실패 - ${error.message}`);
    }
  }
  /** -------------------- */

  /** 전장의 안개 DB에 있는 모든 장소 가져오기 */
  async getAll() {
    const result = await this.prisma.place.findMany({});
    return result;
  }
  /** -------------------- */

  /** 특정 id 를 가진 장소 가져오기 */
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
  /** -------------------- */

  /** 추후 데이터 분석위한  placeVisit 테이블 기록 */
  async createPlaceVisit(userId: number, placeId: number) {
    await this.prisma.placeVisit.create({
      data: {
        visited_user: { connect: { user_id: userId } },
        visited_place: { connect: { place_id: placeId } },
      },
    });
  }
  /** -------------------- */

  /** 특정 id 를 가진 장소의 리뷰를 가져오기 */
  async getPlacePosts(placeId: number) {
    const place = await this.prisma.place.findFirst({
      where: { place_id: placeId },
      select: { place_id: true, place_name: true, place_star_rating: true },
    });
    const posts = await this.prisma.post.findMany({
      where: { post_place_id: placeId, post_is_deleted: false },
      select: {
        post_id: true,
        post_created_at: true,
        post_updated_at: true,
        post_description: true,
        post_image_url: true,
        post_author_id: true,
        post_star_rating: true,
        post_comments: true,
      },
    });

    console.log("posts", posts);
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

      const comments = post.post_comments || [];

      postsWithUserInfo.push({
        ...post,
        post_author: user,
        post_comments: comments, // post_comments가 빈 배열이거나 값이 있는 경우 모두 할당
      });
    }

    const newPlace = { ...place, place_posts: postsWithUserInfo };
    return newPlace;
  }
  /** -------------------- */

  /** 모든 랜드마크 가져오기  */
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
  /** -------------------- */

  /** 장소의 별점 업데이트 로직 */
  async updatePlaceStarRating(place_id: number) {
    const place = await this.prisma.place.findUnique({
      where: { place_id: place_id },
      include: {
        place_posts: { select: { post_star_rating: true } },
      },
    });

    if (!place || !place.place_posts.length) {
      return;
    }

    const totalStarRating = place.place_posts.reduce((sum, post) => {
      return sum + (post.post_star_rating || 0);
    }, 0);

    const averageStarRating = totalStarRating / place.place_posts.length;

    await this.prisma.place.update({
      where: { place_id: place_id },
      data: { place_star_rating: averageStarRating },
    });
  }
  /** -------------------- */
}
