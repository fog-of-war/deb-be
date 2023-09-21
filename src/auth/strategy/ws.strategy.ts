import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { verify } from "jsonwebtoken";

@Injectable()
export class WsStrategy {
  constructor(private configService: ConfigService) {}
  validateToken(authorization: string) {
    if (authorization) {
      const token: string = authorization.split(" ")[1];
      const payload = verify(token, this.configService.get("AT_SECRET"), {
        ignoreExpiration: true,
      });
      return payload;
    }
  }
}
//   static async validateToken(client: Socket) {
//     const { authorization } = client.handshake.headers;

//     if (authorization) {
//       const token: string = authorization.split(" ")[1];
//       const payload = verify(token, "SAMPLE_FOR_COMMIT");
//       console.log("validateToken", payload);
//       return payload;
//     }
//   }
