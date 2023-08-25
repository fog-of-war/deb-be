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
} from "@nestjs/swagger";
import { PlacesService } from "./places.service"; // PlacesService의 경로로 수정해야 합니다.
import { SearchResponse, PlaceCategory } from "./responses"; // 'your-models'는 실제 모델 파일의 경로에 맞게 변경해주세요.

@ApiTags("places")
@Controller("places")
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get("/search")
  @ApiResponse({
    status: 200,
    description: "",
    type: SearchResponse, // 반환 모델을 지정
  })
  @ApiResponse({ status: 404, description: "해당 장소 검색 실패" })
  async getPlaceSearch(
    @Query("query") query: string,
    @Query("x") xCoordinate: number,
    @Query("y") yCoordinate: number,
    @Res() res
  ): Promise<void> {
    try {
      const searchResult: SearchResponse[] =
        await this.placesService.findPlacesInfoFromKakao(
          query,
          xCoordinate,
          yCoordinate
        );

      res.status(HttpStatus.OK).json(searchResult);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred during search." });
    }
  }

  @Get("/all")
  @ApiCreatedResponse({
    status: 200,
  })
  async getAllPlaces() {
    const result = await this.placesService.getAll();
    return result;
  }

  @Get("/:id")
  async getPlace(@Param("id", ParseIntPipe) placeId: number) {
    const result = await this.placesService.getOne(placeId);
    return result;
  }
}
