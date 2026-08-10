import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      passReqToCallback: true,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'my_jwt_secret_key',
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? undefined;
    const user = await this.authService.validateUser(payload, token);
    if (!user) {
      throw new UnauthorizedException(
        'Your session has expired. Please log in again.',
      );
    }
    return { ...user };
  }
}
