import { createElement } from "react";

import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";

import { InvoicePdf } from "@/components/invoice/pdf/invoice-pdf";
import type { Invoice } from "@/types/invoice";

const baseInvoice: Invoice = {
  id: "test-id",
  invoiceNo: "INV-TEST-001",
  clientName: "AAA",
  issuedAt: "2026-01-01",
  expiresAt: "2026-12-31",
  items: [
    { name: "웹사이트 디자인", qty: 1, unitPrice: 1500000 },
    { name: "로고제작", qty: 1, unitPrice: 1000000 },
    { name: "명함디자인", qty: 1, unitPrice: 100000 },
  ],
  subtotal: 2600000,
  vat: 260000,
  total: 2860000,
  memo: "송금 계좌: 우리은행 1234-...",
  accessToken: "x".repeat(43),
  status: "sent",
};

function asPdfElement(invoice: Invoice) {
  return createElement(InvoicePdf, { invoice }) as Parameters<
    typeof renderToBuffer
  >[0];
}

describe("InvoicePdf renderToBuffer", () => {
  it("3 items: PDF 시그니처 + 크기 <400KB", async () => {
    const buf = await renderToBuffer(asPdfElement(baseInvoice));
    expect(buf.subarray(0, 4).toString("ascii")).toBe("%PDF");
    expect(buf.length).toBeLessThan(400_000);
  });

  it("60 items: 페이지 ≥2 + 크기 <400KB", async () => {
    const items = Array.from({ length: 60 }, (_, i) => ({
      name: `테스트 항목 ${i + 1}`,
      qty: 1,
      unitPrice: 10000,
    }));
    const inv: Invoice = {
      ...baseInvoice,
      items,
      subtotal: 600000,
      vat: 60000,
      total: 660000,
    };
    const buf = await renderToBuffer(asPdfElement(inv));
    const text = buf.toString("latin1");
    const pageMatches = text.match(/\/Type\s*\/Page[^s]/g) ?? [];
    expect(buf.subarray(0, 4).toString("ascii")).toBe("%PDF");
    expect(pageMatches.length).toBeGreaterThanOrEqual(2);
    expect(buf.length).toBeLessThan(400_000);
  });
});
