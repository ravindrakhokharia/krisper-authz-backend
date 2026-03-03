import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  const prismaMock = {
    employeeDetail: {
      findFirst: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("returns user when found", async () => {
    const user = { id: "u1", oauthId: "oauth-1" };
    const payload = { id: "oauth-1" };
    prismaMock.employeeDetail.findFirst.mockResolvedValue(user);
    const result = await service.validateUser(payload);
    expect(result).toEqual(payload);
  });

  it("returns null when user not found", async () => {
    const payload = { id: "missing" };
    prismaMock.employeeDetail.findFirst.mockResolvedValue(null);
    const result = await service.validateUser(payload);
    expect(result).toBeNull();
  });
});
