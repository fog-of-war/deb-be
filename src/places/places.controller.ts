import { Controller, Get, Query, Res } from "@nestjs/common";
import { AxiosResponse } from "axios";

@Controller("places")
export class PlacesController {
  private readonly client_id = "w09nlHFa7rKbe4JiUSoG";
  private readonly client_secret = "rTN8tm8Vaq";

  @Get("/search")
  async getBlogSearch(
    @Query("query") query: string,
    @Res() res
  ): Promise<void> {
    const api_url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
      query
    )}&display=5`;
    const axios = require("axios").default;
    const options = {
      headers: {
        "X-Naver-Client-Id": this.client_id,
        "X-Naver-Client-Secret": this.client_secret,
      },
    };

    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
      res.end(JSON.stringify(response.data));
    } catch (error) {
      const statusCode = error?.response?.status || 500;
      res.status(statusCode).end();
      console.error("error = " + statusCode);
    }
  }
}
