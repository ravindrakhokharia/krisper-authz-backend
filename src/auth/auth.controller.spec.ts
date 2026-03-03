import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

class AuthServiceMock {
  validateUser = jest.fn();
}

describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthServiceMock;

  beforeEach(async () => {
    service = new AuthServiceMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
