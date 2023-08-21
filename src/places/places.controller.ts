import { Controller, Get, Query, Res, HttpStatus, Post } from "@nestjs/common";
import { PlacesService } from "./places.service"; // PlacesService의 경로로 수정해야 합니다.

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
      const searchResult = await this.placesService.findPlaceInfoFromKakao(
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

  @Get("/init")
  async initLandmarks(
    @Query("place_name") place_name: string,
    @Query("place_latitude") place_latitude: number,
    @Query("place_longitude") place_longitude: number,
    @Res() res
  ): Promise<void> {
    try {
      const result = await this.placesService.createPlace(
        place_name,
        place_latitude,
        place_longitude
      );
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred during init." });
    }
  }
  @Get("/all")
  async getAllCategories() {
    const result = await this.placesService.getAll();
    return result;
  }
}
