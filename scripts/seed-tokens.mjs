/** generate-token.mjs로 토큰 2개 생성 후 Notion row A(INV-2025-001) / row B(INV-2025-002) access_token에 즉시 저장. 토큰은 stdout/파일에 노출하지 않고 'ok' 또는 'fail'만 출력. */
import { Client } from "@notionhq/client";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const auth = process.env.NOTION_TOKEN;
const dsId = process.env.NOTION_DATA_SOURCE_ID;
if (!auth || !dsId) {
  console.error("missing NOTION_TOKEN or NOTION_DATA_SOURCE_ID");
  process.exit(2);
}

const here = dirname(fileURLToPath(import.meta.url));
const genPath = resolve(here, "generate-token.mjs");
const r = spawnSync(process.execPath, [genPath], { encoding: "utf8" });
if (r.status !== 0) {
  console.error("generate-token.mjs exit:", r.status);
  process.exit(1);
}

const lines = r.stdout.trim().split(/\r?\n/);
if (lines.length !== 2) {
  console.error("expected 2 lines, got", lines.length);
  process.exit(1);
}

const pat = /^row([AB]): ([A-Za-z0-9_-]{43})$/;
const tokens = {};
for (const line of lines) {
  const m = pat.exec(line);
  if (!m) {
    console.error("format mismatch");
    process.exit(1);
  }
  tokens[m[1]] = m[2];
}

const c = new Client({ auth });
const richText = (s) => [{ text: { content: s } }];

async function findId(no) {
  const q = await c.dataSources.query({
    data_source_id: dsId,
    filter: { property: "invoice_no", title: { equals: no } },
  });
  return q.results[0]?.id ?? null;
}

async function setToken(pageId, token) {
  await c.pages.update({
    page_id: pageId,
    properties: { access_token: { rich_text: richText(token) } },
  });
}

try {
  const idA = await findId("INV-2025-001");
  const idB = await findId("INV-2025-002");
  if (!idA || !idB) {
    console.error("missing rows: A=", !!idA, "B=", !!idB);
    process.exit(1);
  }
  await setToken(idA, tokens.A);
  await setToken(idB, tokens.B);

  const verifyQ = await c.dataSources.query({ data_source_id: dsId });
  const pat43 = /^[A-Za-z0-9_-]{43}$/;
  let okCount = 0;
  for (const p of verifyQ.results) {
    const rt = p.properties.access_token?.rich_text;
    const v = rt?.[0]?.plain_text ?? rt?.[0]?.text?.content ?? "";
    if (pat43.test(v)) okCount++;
  }
  const ok = verifyQ.results.length === 2 && okCount === 2;
  console.log(ok ? "ok" : "fail");
  process.exit(ok ? 0 : 1);
} catch (e) {
  console.error("FATAL:", e.code || e.name, e.message);
  process.exit(1);
}
