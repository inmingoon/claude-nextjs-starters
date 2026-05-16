/** 견적서 access_token 2개를 stdout에 출력. 시크릿이므로 파일에 저장하지 않음. */
import { randomBytes } from "node:crypto";

for (const label of ["A", "B"]) {
  process.stdout.write(
    `row${label}: ${randomBytes(32).toString("base64url")}\n`,
  );
}
