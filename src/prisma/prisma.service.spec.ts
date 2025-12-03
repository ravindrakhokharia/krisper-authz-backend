import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";

describe("PrismaService", () => {
  let service: PrismaService;

  // Mock the Prisma client methods
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Manually assign mocks to the service instance
    service.$connect = mockConnect;
    service.$disconnect = mockDisconnect;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("onModuleInit", () => {
    it("should connect to the database when module initializes", async () => {
      // Arrange
      mockConnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledWith();
    });

    it("should handle connection errors gracefully", async () => {
      // Arrange
      const connectionError = new Error("Database connection failed");
      mockConnect.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow(
        "Database connection failed"
      );
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe("onModuleDestroy", () => {
    it("should disconnect from the database when module is destroyed", async () => {
      // Arrange
      mockDisconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
      expect(mockDisconnect).toHaveBeenCalledWith();
    });

    it("should handle disconnection errors gracefully", async () => {
      // Arrange
      const disconnectionError = new Error("Database disconnection failed");
      mockDisconnect.mockRejectedValue(disconnectionError);

      // Act & Assert
      await expect(service.onModuleDestroy()).rejects.toThrow(
        "Database disconnection failed"
      );
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration tests", () => {
    it("should properly initialize and cleanup database connections", async () => {
      // Arrange
      mockConnect.mockResolvedValue(undefined);
      mockDisconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();
      await service.onModuleDestroy();

      // Assert
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple initialization calls", async () => {
      // Arrange
      mockConnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();
      await service.onModuleInit();

      // Assert
      expect(mockConnect).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple destruction calls", async () => {
      // Arrange
      mockDisconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleDestroy();
      await service.onModuleDestroy();

      // Assert
      expect(mockDisconnect).toHaveBeenCalledTimes(2);
    });
  });

  describe("Service inheritance", () => {
    it("should extend PrismaClient and have access to its methods", () => {
      // The service should have inherited all PrismaClient methods
      expect(service).toHaveProperty("$connect");
      expect(service).toHaveProperty("$disconnect");
      expect(typeof service.$connect).toBe("function");
      expect(typeof service.$disconnect).toBe("function");
    });

    it("should implement OnModuleInit interface", () => {
      expect(typeof service.onModuleInit).toBe("function");
    });

    it("should implement OnModuleDestroy interface", () => {
      expect(typeof service.onModuleDestroy).toBe("function");
    });

    it("should have PrismaService constructor name", () => {
      expect(service.constructor.name).toBe("PrismaService");
    });
  });

  describe("Lifecycle hooks", () => {
    it("should call $connect exactly once per onModuleInit call", async () => {
      // Arrange
      mockConnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("should call $disconnect exactly once per onModuleDestroy call", async () => {
      // Arrange
      mockDisconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent initialization calls", async () => {
      // Arrange
      mockConnect.mockResolvedValue(undefined);

      // Act
      const promises = [
        service.onModuleInit(),
        service.onModuleInit(),
        service.onModuleInit(),
      ];
      await Promise.all(promises);

      // Assert
      expect(mockConnect).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent destruction calls", async () => {
      // Arrange
      mockDisconnect.mockResolvedValue(undefined);

      // Act
      const promises = [
        service.onModuleDestroy(),
        service.onModuleDestroy(),
        service.onModuleDestroy(),
      ];
      await Promise.all(promises);

      // Assert
      expect(mockDisconnect).toHaveBeenCalledTimes(3);
    });
  });

  describe("Error handling", () => {
    it("should propagate connection errors with original message", async () => {
      // Arrange
      const originalError = new Error("Connection timeout");
      mockConnect.mockRejectedValue(originalError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should propagate disconnection errors with original message", async () => {
      // Arrange
      const originalError = new Error("Disconnection timeout");
      mockDisconnect.mockRejectedValue(originalError);

      // Act & Assert
      await expect(service.onModuleDestroy()).rejects.toThrow(
        "Disconnection timeout"
      );
    });

    it("should handle network-related connection errors", async () => {
      // Arrange
      const networkError = new Error("ENOTFOUND database.example.com");
      mockConnect.mockRejectedValue(networkError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow(
        "ENOTFOUND database.example.com"
      );
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("should handle authentication errors during connection", async () => {
      // Arrange
      const authError = new Error("Invalid database credentials");
      mockConnect.mockRejectedValue(authError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow(
        "Invalid database credentials"
      );
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });
});
