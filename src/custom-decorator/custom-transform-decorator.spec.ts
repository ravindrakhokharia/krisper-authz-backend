import { describe, expect, it } from "@jest/globals";
import { plainToInstance } from "class-transformer";
import { BadRequestException } from "@nestjs/common";
import {
  TransformDate,
  TransformUppercase,
  TransformEnum,
  TransformStringify,
  TransformParse,
  TransformToNumber,
  TransformToBoolean,
} from "./custom-transform-decorator";

// Helper enum for testing
enum Color {
  RED = 1,
  GREEN = 2,
}

class TestDto {
  @TransformDate()
  date!: string;

  @TransformDate({ isNullable: true })
  maybeDate!: string | null;

  @TransformUppercase()
  upper!: string;

  @TransformEnum(Color)
  color!: number;

  @TransformStringify()
  jsonString!: string;

  @TransformParse()
  parsed!: any;

  @TransformToNumber("age")
  age!: number;

  @TransformToBoolean("isActive")
  isActive!: boolean;
}

describe("custom-transform-decorator", () => {
  it("transforms valid date to ISO string", () => {
    const instance = plainToInstance(TestDto, { date: "2025-11-08" });
    expect(instance.date).toMatch(/^2025-11-08T/);
  });

  it("returns null for nullable empty date", () => {
    const instance = plainToInstance(TestDto, { maybeDate: "" });
    expect(instance.maybeDate).toBeNull();
  });

  it("throws for invalid date when not nullable", () => {
    expect(() => plainToInstance(TestDto, { date: "invalid-date" })).toThrow(
      BadRequestException
    );
  });

  it("uppercases strings", () => {
    const instance = plainToInstance(TestDto, { upper: "hello" });
    expect(instance.upper).toBe("HELLO");
  });

  it("maps enum by key string", () => {
    const instance = plainToInstance(TestDto, { color: "RED" });
    expect(instance.color).toBe(Color.RED);
  });

  it("maps enum by numeric string index", () => {
    const instance = plainToInstance(TestDto, { color: "2" });
    expect(instance.color).toBe(Color.GREEN);
  });

  it("stringifies object", () => {
    const obj = { a: 1 };
    const instance = plainToInstance(TestDto, { jsonString: obj });
    expect(instance.jsonString).toBe(JSON.stringify(obj));
  });

  it("parses JSON", () => {
    const instance = plainToInstance(TestDto, { parsed: '{"b":2}' });
    expect(instance.parsed).toEqual({ b: 2 });
  });

  it("transforms number string to number", () => {
    const instance = plainToInstance(TestDto, { age: "42" });
    expect(instance.age).toBe(42);
  });

  it("throws on invalid number", () => {
    expect(() => plainToInstance(TestDto, { age: "xx" })).toThrow(
      BadRequestException
    );
  });

  it("transforms truthy boolean", () => {
    const instance = plainToInstance(TestDto, { isActive: "true" });
    expect(instance.isActive).toBe(true);
  });

  it("transforms falsy boolean", () => {
    const instance = plainToInstance(TestDto, { isActive: "" });
    expect(instance.isActive).toBe(false);
  });
});
