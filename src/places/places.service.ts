import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";

@Injectable()
export class PlacesService {
  private readonly clientID: string;

  constructor(private config: ConfigService) {
    this.clientID = this.config.get("KAKAO_CLIENT_ID");
  }

  async findPlaceInfoFromKakao(x: any, y: any): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/geo/coord2address.json`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        x: x,
        y: y,
        input_coord: "WGS84",
      },
    };
    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
