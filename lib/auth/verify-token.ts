import "server-only";

import { timingSafeEqual } from "node:crypto";

/**
 * 상수 시간 비교로 견적서 access_token을 검증한다.
 *
 * 길이가 다르면 즉시 거부하여 timingSafeEqual의 길이 일치 사전 조건을 만족한다.
 *
 * @param provided URL 쿼리스트링에서 받은 토큰 (undefined 가능)
 * @param expected Notion row의 access_token
 * @returns 토큰이 정확히 일치하면 true
 */
export function verifyToken(
  provided: string | undefined,
  expected: string,
): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
