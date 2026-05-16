import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const HAS_NOTION =
  !!process.env.NOTION_TOKEN && !!process.env.NOTION_DATA_SOURCE_ID;

describe("getInvoiceById (integration)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock("@notionhq/client");
  });

  it.skipIf(!HAS_NOTION)("row A(INV-2025-001) 매핑", async () => {
    const { Client } = await import("@notionhq/client");
    const c = new Client({ auth: process.env.NOTION_TOKEN });
    const q = await c.dataSources.query({
      data_source_id: process.env.NOTION_DATA_SOURCE_ID as string,
      filter: { property: "invoice_no", title: { equals: "INV-2025-001" } },
    });
    const rowAId = q.results[0]?.id;
    expect(rowAId).toBeDefined();

    const { getInvoiceById } = await import("@/lib/notion");
    const inv = await getInvoiceById(rowAId as string);
    expect(inv).not.toBeNull();
    expect(inv!.invoiceNo).toBe("INV-2025-001");
    expect(inv!.clientName).toBe("AAA");
    expect(inv!.items).toHaveLength(3);
    expect(inv!.items[0]).toMatchObject({
      name: "웹사이트 디자인",
      qty: 2,
      unitPrice: 1500000,
    });
    expect(inv!.subtotal).toBe(5000000);
    expect(inv!.vat).toBe(500000);
    expect(inv!.total).toBe(5500000);
    expect(inv!.status).toBe("draft");
    expect(inv!.accessToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it.skipIf(!HAS_NOTION)("존재하지 않는 id → null", async () => {
    const { getInvoiceById } = await import("@/lib/notion");
    const inv = await getInvoiceById("00000000-0000-0000-0000-000000000000");
    expect(inv).toBeNull();
  });
});

describe("getInvoiceById (unit, mocked SDK)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("@notionhq/client");
  });

  it("깨진 items JSON → InvoiceParseError", async () => {
    vi.doMock("@notionhq/client", () => ({
      Client: class {
        pages = {
          retrieve: vi.fn(async () => ({
            object: "page",
            id: "fake",
            properties: {
              invoice_no: { type: "title", title: [] },
              client_name: { type: "rich_text", rich_text: [] },
              issued_at: { type: "date", date: null },
              expires_at: { type: "date", date: null },
              items: {
                type: "rich_text",
                rich_text: [{ plain_text: "{not valid json" }],
              },
              subtotal: { type: "number", number: 0 },
              vat: { type: "number", number: 0 },
              total: { type: "number", number: 0 },
              memo: { type: "rich_text", rich_text: [] },
              access_token: { type: "rich_text", rich_text: [] },
              status: { type: "select", select: null },
            },
          })),
        };
      },
      APIErrorCode: { ObjectNotFound: "object_not_found" },
      isFullPage: () => true,
    }));

    const { getInvoiceById } = await import("@/lib/notion");
    const { InvoiceParseError } = await import("@/types/invoice");
    await expect(getInvoiceById("fake-id")).rejects.toThrow(InvoiceParseError);
  });
});
