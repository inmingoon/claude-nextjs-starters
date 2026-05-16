import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * vitest 진입점. tsconfig의 paths(@/*)는 vitest v4 + vite 7의 native
 * resolve.tsconfigPaths 옵션으로 자동 연동. .env.local은 loadEnv로 명시 주입
 * (vitest는 기본 자동 로드 안 함). `server-only`은 Next.js 빌드 sentinel이라
 * 테스트 런타임에서는 빈 모듈로 alias.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode || "test", process.cwd(), "");
  return {
    resolve: {
      tsconfigPaths: true,
      alias: {
        "server-only": resolve(here, "tests/_helpers/server-only.ts"),
      },
    },
    oxc: {
      jsx: { runtime: "automatic" },
    },
    test: {
      globals: true,
      environment: "node",
      include: ["tests/**/*.test.ts"],
      env,
    },
  };
});
