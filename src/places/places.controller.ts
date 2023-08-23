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
import { ApiTags, ApiBearerAuth, ApiCreatedResponse } from "@nestjs/swagger";
import { PlacesService } from "./places.service"; // PlacesService의 경로로 수정해야 합니다.

@ApiTags("places")
@Controller("places")
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get("/search")
  async getPlaceSearch(
    @Query("query") query: string,
    @Query("x") xCoordinate: number,
    @Query("y") yCoordinate: number,
    @Res() res
  ): Promise<void> {
    try {
      const searchResult = await this.placesService.findPlacesInfoFromKakao(
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

  // @Get("/search")
  // async getPlaceSearch(@Query("query") query: string): Promise<any> {
  //   try {
  //     const searchResult = await this.placesService.findPlaceInfoFromKakao(
  //       query
  //     );
  //     return searchResult;
  //   } catch (error) {
  //     throw new NotFoundException("해당 장소를 찾을 수 없습니다.");
  //   }
  // }

  // @Get("/search/coordinate")
  // async getPlaceSearchWitCoordinates(
  //   @Query("query") query: string,
  //   @Query("x") xCoordinate?: number, // 선택적 파라미터
  //   @Query("y") yCoordinate?: number // 선택적 파라미터
  // ): Promise<any> {
  //   try {
  //     const searchResult = await this.placesService.findPlaceInfoFromKakao(
  //       query,
  //       xCoordinate,
  //       yCoordinate
  //     );
  //     return searchResult;
  //   } catch (error) {
  //     throw new NotFoundException("해당 장소를 찾을 수 없습니다.");
  //   }
  // }

  // @Get("/init")
  // async initLandmarks(
  //   @Query("place_name") place_name: string,
  //   @Query("place_latitude") place_latitude: number,
  //   @Query("place_longitude") place_longitude: number,
  //   @Res() res
  // ): Promise<void> {
  //   try {
  //     const result = await this.placesService.createPlace(
  //       place_name,
  //       place_latitude,
  //       place_longitude
  //     );
  //     res.status(HttpStatus.OK).json(result);
  //   } catch (error) {
  //     res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .json({ message: "Error occurred during init." });
  //   }
  // }
}
