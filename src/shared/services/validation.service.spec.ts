import { describe, expect, it, jest } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import { ValidationService } from "./validation.service";

// Minimal prisma mock with dynamic model access
// Use loose typing to avoid Prisma type constraints in unit tests
const makePrisma = (found: boolean): any => ({
  employeeDetail: {
    findUnique: (jest.fn() as any).mockResolvedValue(
      found ? { id: "emp-1" } : null
    ),
  },
  department: {
    findUnique: (jest.fn() as any).mockResolvedValue(found ? { id: 2 } : null),
  },
});

describe("ValidationService", () => {
  it("validateReference returns record when found", async () => {
    const prisma = makePrisma(true);
    const service = new ValidationService(prisma as any);

    const rec = await service.validateReference("employeeDetail", "emp-1");
    expect(rec).toEqual({ id: "emp-1" });
    expect(prisma.employeeDetail.findUnique).toHaveBeenCalledWith({
      where: { id: "emp-1" },
    });
  });

  it("validateReference throws when missing", async () => {
    const prisma = makePrisma(false);
    const service = new ValidationService(prisma as any);

    await expect(
      service.validateReference("employeeDetail", "missing")
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.validateReference("employeeDetail", "missing")
    ).rejects.toThrow(/EmployeeDetail ID is invalid or record not found/);
  });

  it("validateReferences maps keys ending with Id and returns records", async () => {
    const prisma = makePrisma(true);
    const service = new ValidationService(prisma as any);

    const res = await service.validateReferences({
      employeeDetailId: "emp-1",
      departmentId: 2,
    });
    expect(res).toEqual({
      employeeDetail: { id: "emp-1" },
      department: { id: 2 },
    });
  });

  it("validateReference no-op when id falsy", async () => {
    const prisma = makePrisma(true);
    const service = new ValidationService(prisma as any);

    await expect(
      service.validateReference("employeeDetail", "")
    ).resolves.toBeUndefined();
  });
});
