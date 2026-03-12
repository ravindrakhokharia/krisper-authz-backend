import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { of } from "rxjs";

describe("AuthService", () => {
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
    get: jest.fn().mockReturnValue("http://oauth-api"),
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

  it("returns user when found", async () => {
    const user = { data: { id: "u1", oauthId: "oauth-1" } };
    const payload = { id: "oauth-1" };
    httpMock.get.mockReturnValue(of({ data: user }));
    const result = await service.validateUser(payload);
    expect(result).toEqual(user.data);
  });

  it("returns null when user not found", async () => {
    const payload = { id: "missing" };
    httpMock.get.mockReturnValue(of({ data: { data: null } }));
    const result = await service.validateUser(payload);
    expect(result).toBeNull();
  });
});
