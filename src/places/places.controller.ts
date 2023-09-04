import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Post,
  Param,
  ParseIntPipe,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { PlacesService } from "./places.service"; // PlacesService의 경로로 수정해야 합니다.
import {
  SearchResponse,
  GetPlaceById,
  PlaceWithPostsResponse,
  landmarksResponse,
} from "./responses"; // 'your-models'는 실제 모델 파일의 경로에 맞게 변경해주세요.
import { LoggerService } from "src/logger/logger.service";

@ApiTags("places")
@Controller("places")
export class PlacesController {
  /**
   *
   *
   */
  constructor(
    private readonly placesService: PlacesService,
    private logger: LoggerService
  ) {}
  /**
   *
   *
   */
  @Get("/landmarks")
  @ApiOperation({ summary: "랜드마크 가져오기/ 탐험 추천 장소" })
  @ApiResponse({
    status: 200,
    description: "",
    type: landmarksResponse,
  })
  async getLandmarks() {
    const result = await this.placesService.getLandmarks();
    return result;
  }
  /**
   *
   *
   */
  @Get("/forjh")
  @ApiOperation({
    summary: "정훈님에게 선물 장소검색하기/ query 필요",
  })
  @ApiResponse({
    status: 200,
    description: "",
    type: SearchResponse, // 반환 모델을 지정
  })
  @ApiResponse({ status: 404, description: "해당 장소 검색 실패" })
  async jhPlaceSearch(
    @Query("query") query: string,
    @Res() res
  ): Promise<void> {
    try {
      const searchResult = await this.placesService.findPlacesInfoForJH(query);
      res.status(HttpStatus.OK).json(searchResult);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred during search." });
    }
  }
  /**
   *
   *
   */

  @ApiOperation({
    summary: "장소검색하기/ x,y,query 필요, 현재 주변 3km 검색 가능",
  })
  @ApiResponse({
    status: 200,
    description: "",
    type: SearchResponse, // 반환 모델을 지정
  })
  @ApiResponse({ status: 404, description: "해당 장소 검색 실패" })
  @Get("/search")
  async getPlaceSearch(
    @Query("query") query: string,
    @Query("x") xCoordinate: number,
    @Query("y") yCoordinate: number,
    @Res() res
  ): Promise<void> {
    try {
      //http://localhost:5000/v1/places/search?x=126.975278&y=37.559722&query=숭례문
      this.logger.log(
        `🔍 위도(latitude) : ${yCoordinate}, 경도(longitude) : ${xCoordinate}, 검색어 : ${query}`
      );
      const searchResult: SearchResponse[] =
        await this.placesService.findPlacesInfoFromKakao(
          xCoordinate,
          yCoordinate,
          query
        );
      res.status(HttpStatus.OK).json(searchResult);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred during search." });
    }
  }
  /**
   *
   *
   */
  @Get("/all")
  @ApiOperation({
    summary: "데이터베이스에 있는 모든 장소 가져오기(랜드마크, 게시장소 포함)",
  })
  @ApiCreatedResponse({
    status: 200,
  })
  async getAllPlaces() {
    const result = await this.placesService.getAll();
    return result;
  }
  /**
   *
   *
   */
  @Get("/:id")
  @ApiOperation({ summary: "특정 id 를 가진 장소 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: GetPlaceById, // 반환 모델을 지정
  })
  async getPlace(@Param("id", ParseIntPipe) placeId: number) {
    const result: GetPlaceById = await this.placesService.getOne(placeId);
    return result;
  }
  /**
   *
   *
   */
  @Get("/:id/posts")
  @ApiOperation({ summary: "특정 id 를 가진 장소의 리뷰를 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: PlaceWithPostsResponse,
  })
  async getPlacePosts(@Param("id", ParseIntPipe) placeId: number) {
    const result = await this.placesService.getPlacePosts(placeId);
    this.logger.log(`장소id (${placeId}) 의 게시물들이 조회됨 `);
    return result;
  }
}
