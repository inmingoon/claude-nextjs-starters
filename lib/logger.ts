type Level = "debug" | "info" | "warn" | "error";

const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function readThreshold(): number {
  const raw = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  if (raw in ORDER) return ORDER[raw as Level];
  return ORDER.info;
}

const threshold = readThreshold();

function emit(level: Level, payload: Record<string, unknown>): void {
  if (ORDER[level] < threshold) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    ...payload,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * 구조화 로거. 항상 객체를 받아 JSON 한 줄로 직렬화한다.
 *
 * 사용 규칙:
 *  - 시크릿/토큰을 페이로드에 포함하지 말 것 (PRD §7).
 *  - 호출자 컨텍스트를 알 수 있도록 `event` 키를 권장 (예: `event: "token.denied"`).
 *  - Edge / Node / 브라우저 어디서나 동작 (process.env.LOG_LEVEL은 브라우저에서 undefined → info).
 */
export const logger = {
  debug: (payload: Record<string, unknown>) => emit("debug", payload),
  info: (payload: Record<string, unknown>) => emit("info", payload),
  warn: (payload: Record<string, unknown>) => emit("warn", payload),
  error: (payload: Record<string, unknown>) => emit("error", payload),
};
