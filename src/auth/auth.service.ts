import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  async validateUser(payload) {
    const userId = payload?.id || payload?.sub || payload?.userId;
    if (!userId) {
      throw new UnauthorizedException('Token payload is missing user id');
    }

    const oauthApiUrl = this.configService.get<string>('OAUTH_API_URL');
    if (!oauthApiUrl) {
      throw new UnauthorizedException('OAUTH_API_URL is not configured');
    }

    let user;

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${oauthApiUrl}/users/${userId}`),
      );
      user = response.data;
    } catch {
      throw new UnauthorizedException('Unable to validate user from token');
    }

    if (user.data) {
      return user.data;
    }

    return null;
  }
}
