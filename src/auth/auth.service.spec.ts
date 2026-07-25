import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock = {
    employeeDetail: {
      findFirst: jest.fn(),
    },
  } as any;

  const httpMock = {
    get: jest.fn(),
  };

  const configMock = {
    get: jest.fn().mockReturnValue('http://oauth-api'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns user when found', async () => {
    const user = { data: { id: 'u1', oauthId: 'oauth-1' } };
    const payload = { id: 'oauth-1' };
    httpMock.get.mockReturnValue(of({ data: user }));
    const result = await service.validateUser(payload);
    expect(result).toEqual(user.data);
  });

  it('returns user when found via sub in payload', async () => {
    const user = { data: { id: 'u1', oauthId: 'oauth-1' } };
    const payload = { sub: 'oauth-1' };
    httpMock.get.mockReturnValue(of({ data: user }));
    const result = await service.validateUser(payload);
    expect(result).toEqual(user.data);
  });

  it('returns user when found via userId in payload', async () => {
    const user = { data: { id: 'u1', oauthId: 'oauth-1' } };
    const payload = { userId: 'oauth-1' };
    httpMock.get.mockReturnValue(of({ data: user }));
    const result = await service.validateUser(payload);
    expect(result).toEqual(user.data);
  });

  it('returns null when user not found', async () => {
    const payload = { id: 'missing' };
    httpMock.get.mockReturnValue(of({ data: { data: null } }));
    const result = await service.validateUser(payload);
    expect(result).toBeNull();
  });

  it('returns null when response data is missing data field', async () => {
    const payload = { id: 'u1' };
    httpMock.get.mockReturnValue(of({ data: {} }));
    const result = await service.validateUser(payload);
    expect(result).toBeNull();
  });

  it('throws UnauthorizedException when payload is missing userId', async () => {
    const payload = {};
    await expect(service.validateUser(payload)).rejects.toThrow(
      'Token payload is missing user id',
    );
  });

  it('throws UnauthorizedException when OAUTH_API_URL is not configured', async () => {
    configMock.get.mockReturnValue(null);
    const payload = { id: 'u1' };
    await expect(service.validateUser(payload)).rejects.toThrow(
      'OAUTH_API_URL is not configured',
    );
    configMock.get.mockReturnValue('http://oauth-api');
  });

  it('throws UnauthorizedException when HTTP request fails', async () => {
    const payload = { id: 'u1' };
    (httpMock.get as jest.Mock).mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    await expect(service.validateUser(payload)).rejects.toThrow(
      'Unable to validate user from token',
    );
  });
});
