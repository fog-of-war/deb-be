import { Controller, Get, Query, Res, HttpStatus } from "@nestjs/common";
import { PlacesService } from "./places.service"; // PlacesService의 경로로 수정해야 합니다.

@Controller("places")
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get("/search")
  async getPlaceSearch(
    @Query("query") query: number,
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
}
