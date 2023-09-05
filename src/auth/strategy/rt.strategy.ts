import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtPayloadWithRt } from '../types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('RT_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    try {
      const refreshToken = req
        ?.get('authorization')
        ?.replace('Bearer', '')
        .trim();
      if (!refreshToken) {
        console.error('Refresh token malformed');
        throw new ForbiddenException('Refresh token malformed');
      }

      console.log('Refresh token validation successful:', refreshToken);
      return {
        ...payload,
        refreshToken,
      };
    } catch (error) {
      // 예외 처리 로직을 추가합니다.
      console.error('Refresh token validation error:', error);
      throw new ForbiddenException('Refresh token validation failed');
    }
  }
}