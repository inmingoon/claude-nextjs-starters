import { describe, expect, it } from "vitest";

import { verifyToken } from "@/lib/auth/verify-token";

const expected = "a".repeat(43);

describe("verifyToken", () => {
  it("정상 토큰 → true", () => {
    expect(verifyToken(expected, expected)).toBe(true);
  });

  it("마지막 글자 변조 → false", () => {
    const bad = expected.slice(0, -1) + "b";
    expect(verifyToken(bad, expected)).toBe(false);
  });

  it("길이 다름 → false", () => {
    expect(verifyToken("short", expected)).toBe(false);
  });

  it("undefined → false", () => {
    expect(verifyToken(undefined, expected)).toBe(false);
  });

  it("어느 케이스도 throw 안 함", () => {
    expect(() => verifyToken(undefined, expected)).not.toThrow();
    expect(() => verifyToken("short", expected)).not.toThrow();
    expect(() => verifyToken(expected, expected)).not.toThrow();
  });
});
