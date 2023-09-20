import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtPayload } from "../types";
import { WsException } from "@nestjs/websockets";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, "wsjwt") {
  constructor(private config: ConfigService) {
    super({
      // jwtFromRequest: (req) => {
      //   // sec-websocket-protocol 헤더를 사용하여 토큰 추출
      //   return req.handshake.headers["sec-websocket-protocol"];
      // },
      // jwtFromRequest: ExtractJwt.fromHeader("access_token"),jwtFromRequest: ExtractJwt.fromHeader("access_token"),
      jwtFromRequest: ExtractJwt.fromBodyField("access_token"),
      secretOrKey: config.get<string>("AT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    try {
      console.log("ws-at.strategy", payload);
      return payload;
    } catch (error) {
      console.log("ws-at.strategy", error.message);
      throw new WsException("Unauthorized access");
      return false; // 인증 실패
    }
  }
}
