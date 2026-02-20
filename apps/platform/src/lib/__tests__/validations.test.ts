import { describe, it, expect } from "vitest";
import {
  paginationSchema,
  idParamSchema,
  emailSchema,
  phoneSchema,
  dateSchema,
  optionalDateSchema,
  parseSearchParams,
} from "../validations";
import { z } from "zod";

describe("paginationSchema", () => {
  it("parses valid page and pageSize", () => {
    const result = paginationSchema.parse({ page: "3", pageSize: "50" });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it("applies defaults when values are omitted", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it("coerces string values to numbers", () => {
    const result = paginationSchema.parse({ page: "2", pageSize: "10" });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it("rejects page less than 1", () => {
    expect(() => paginationSchema.parse({ page: "0" })).toThrow();
    expect(() => paginationSchema.parse({ page: "-1" })).toThrow();
  });

  it("rejects pageSize less than 1", () => {
    expect(() => paginationSchema.parse({ pageSize: "0" })).toThrow();
  });

  it("rejects pageSize greater than 100", () => {
    expect(() => paginationSchema.parse({ pageSize: "101" })).toThrow();
  });

  it("rejects non-integer values", () => {
    // coerce will turn "1.5" into 1.5 which fails int()
    expect(() => paginationSchema.parse({ page: "1.5" })).toThrow();
  });
});

describe("idParamSchema", () => {
  it("accepts a non-empty string id", () => {
    const result = idParamSchema.parse({ id: "clxyz1234567890abcdef" });
    expect(result.id).toBe("clxyz1234567890abcdef");
  });

  it("rejects an empty string", () => {
    expect(() => idParamSchema.parse({ id: "" })).toThrow();
  });

  it("rejects missing id", () => {
    expect(() => idParamSchema.parse({})).toThrow();
  });
});

describe("emailSchema", () => {
  it("accepts valid email addresses", () => {
    expect(emailSchema.parse("user@example.com")).toBe("user@example.com");
    expect(emailSchema.parse("test.user+tag@domain.co")).toBe("test.user+tag@domain.co");
  });

  it("rejects invalid email addresses", () => {
    expect(() => emailSchema.parse("not-an-email")).toThrow();
    expect(() => emailSchema.parse("@domain.com")).toThrow();
    expect(() => emailSchema.parse("")).toThrow();
  });
});

describe("phoneSchema", () => {
  it("accepts valid phone numbers", () => {
    expect(phoneSchema.parse("+1 (555) 123-4567")).toBe("+1 (555) 123-4567");
    expect(phoneSchema.parse("5551234567")).toBe("5551234567");
    expect(phoneSchema.parse("+44 20 7946 0958")).toBe("+44 20 7946 0958");
  });

  it("accepts empty string", () => {
    expect(phoneSchema.parse("")).toBe("");
  });

  it("accepts undefined (optional)", () => {
    expect(phoneSchema.parse(undefined)).toBeUndefined();
  });

  it("rejects invalid phone formats", () => {
    expect(() => phoneSchema.parse("abc-def-ghij")).toThrow();
    expect(() => phoneSchema.parse("phone: 555")).toThrow();
  });
});

describe("dateSchema", () => {
  it("coerces a valid date string to a Date object", () => {
    const result = dateSchema.parse("2024-01-15");
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
  });

  it("rejects invalid date strings", () => {
    expect(() => dateSchema.parse("not-a-date")).toThrow();
  });
});

describe("optionalDateSchema", () => {
  it("coerces a valid date string", () => {
    const result = optionalDateSchema.parse("2024-06-01");
    expect(result).toBeInstanceOf(Date);
  });

  it("returns undefined for empty string", () => {
    const result = optionalDateSchema.parse("");
    expect(result).toBeUndefined();
  });

  it("accepts undefined", () => {
    const result = optionalDateSchema.parse(undefined);
    expect(result).toBeUndefined();
  });
});

describe("parseSearchParams", () => {
  it("parses URLSearchParams with the given schema", () => {
    const params = new URLSearchParams("page=2&pageSize=50");
    const result = parseSearchParams(params, paginationSchema);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(50);
  });

  it("applies schema defaults for missing params", () => {
    const params = new URLSearchParams("");
    const result = parseSearchParams(params, paginationSchema);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it("throws on invalid values", () => {
    const params = new URLSearchParams("page=0");
    expect(() => parseSearchParams(params, paginationSchema)).toThrow();
  });
});
