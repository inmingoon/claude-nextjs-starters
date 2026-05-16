import { Client } from "@notionhq/client";

const auth = process.env.NOTION_TOKEN;
const dsId = process.env.NOTION_DATA_SOURCE_ID;
if (!auth || !dsId) {
  console.error("missing NOTION_TOKEN or NOTION_DATA_SOURCE_ID");
  process.exit(2);
}

const c = new Client({ auth });

const ROW_A_ITEMS = [
  { name: "웹사이트 디자인", qty: 2, unit_price: 1500000 },
  { name: "로고제작", qty: 1, unit_price: 1000000 },
  { name: "명함디자인", qty: 100, unit_price: 10000 },
];
const ROW_B_ITEMS = [{ name: "테스트 항목", qty: 1, unit_price: 100000 }];

const richText = (s) => [{ text: { content: s } }];

async function findByInvoiceNo(no) {
  const q = await c.dataSources.query({
    data_source_id: dsId,
    filter: { property: "invoice_no", title: { equals: no } },
  });
  return q.results[0] ?? null;
}

async function pass3UpdateRowA() {
  const row = await findByInvoiceNo("INV-2025-001");
  if (!row) {
    console.log("pass3 skip: row A (INV-2025-001) not found");
    return;
  }
  const u = await c.pages.update({
    page_id: row.id,
    properties: {
      items: { rich_text: richText(JSON.stringify(ROW_A_ITEMS)) },
      vat: { number: 500000 },
      total: { number: 5500000 },
      status: { select: { name: "draft" } },
    },
  });
  console.log(
    "pass3 ok | subtotal:",
    u.properties.subtotal.number,
    "vat:",
    u.properties.vat.number,
    "total:",
    u.properties.total.number,
    "status:",
    u.properties.status.select.name,
  );
}

async function pass4CreateRowB() {
  const existing = await findByInvoiceNo("INV-2025-002");
  if (existing) {
    console.log(
      "pass4 skip: row B (INV-2025-002) already exists:",
      existing.id,
    );
    return;
  }
  const u = await c.pages.create({
    parent: { type: "data_source_id", data_source_id: dsId },
    properties: {
      invoice_no: { title: richText("INV-2025-002") },
      client_name: { rich_text: richText("BBB") },
      issued_at: { date: { start: "2026-03-01" } },
      expires_at: { date: { start: "2026-04-01" } },
      status: { select: { name: "sent" } },
      items: { rich_text: richText(JSON.stringify(ROW_B_ITEMS)) },
      subtotal: { number: 100000 },
      vat: { number: 10000 },
      total: { number: 110000 },
    },
  });
  console.log("pass4 ok | created row B:", u.id);
}

async function pass5Verify() {
  const ds = await c.dataSources.retrieve({ data_source_id: dsId });
  const want = [
    "access_token",
    "client_name",
    "expires_at",
    "invoice_no",
    "issued_at",
    "items",
    "memo",
    "status",
    "subtotal",
    "total",
    "vat",
  ];
  const got = Object.keys(ds.properties).sort();
  const opts = ds.properties.status.select.options
    .map((o) => o.name)
    .sort()
    .join(",");
  const okKeys = JSON.stringify(got) === JSON.stringify(want);
  const okStatus = opts === "draft,sent,viewed";
  console.log("pass5 verdict:", okKeys && okStatus ? "ok" : "fail");
  if (!okKeys) console.log("  keys diff: got", got);
  if (!okStatus) console.log("  status opts:", opts);
}

try {
  await pass3UpdateRowA();
  await pass4CreateRowB();
  await pass5Verify();
} catch (e) {
  console.error("FATAL:", e.code || e.name, "-", e.message);
  process.exit(1);
}
