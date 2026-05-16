import "server-only";

import { APIErrorCode, Client, isFullPage } from "@notionhq/client";

import { InvoiceParseError } from "@/types/invoice";
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/types/invoice";

const token = process.env.NOTION_TOKEN;
if (!token) {
  throw new Error("NOTION_TOKEN missing");
}

const notion = new Client({ auth: token });

type RichTextItem = { plain_text: string };
type Properties = Record<string, { type: string } & Record<string, unknown>>;

function concatRichText(items: RichTextItem[]): string {
  return items.map((i) => i.plain_text).join("");
}

function getTitle(props: Properties, key: string): string {
  const p = props[key];
  if (!p || p.type !== "title") return "";
  return concatRichText((p as unknown as { title: RichTextItem[] }).title);
}

function getRichText(props: Properties, key: string): string {
  const p = props[key];
  if (!p || p.type !== "rich_text") return "";
  return concatRichText(
    (p as unknown as { rich_text: RichTextItem[] }).rich_text,
  );
}

function getNumber(props: Properties, key: string): number | null {
  const p = props[key];
  if (!p || p.type !== "number") return null;
  return (p as unknown as { number: number | null }).number;
}

function getDate(props: Properties, key: string): string {
  const p = props[key];
  if (!p || p.type !== "date") return "";
  const d = (p as unknown as { date: { start: string } | null }).date;
  return d?.start ?? "";
}

function getSelect(props: Properties, key: string): string {
  const p = props[key];
  if (!p || p.type !== "select") return "";
  const s = (p as unknown as { select: { name: string } | null }).select;
  return s?.name ?? "";
}

function isInvoiceStatus(v: string): v is InvoiceStatus {
  return v === "draft" || v === "sent" || v === "viewed";
}

/** Notion page(견적서 row)를 도메인 Invoice로 매핑. 404/40x → null, 5xx만 throw. items JSON 파싱 실패 시 InvoiceParseError throw. */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  let page: Awaited<ReturnType<typeof notion.pages.retrieve>>;
  try {
    page = await notion.pages.retrieve({ page_id: id });
  } catch (e: unknown) {
    const err = e as { code?: string; status?: number };
    if (err.code === APIErrorCode.ObjectNotFound) return null;
    if (
      typeof err.status === "number" &&
      err.status >= 400 &&
      err.status < 500
    ) {
      return null;
    }
    throw e;
  }

  if (!isFullPage(page)) return null;

  const props = page.properties as unknown as Properties;

  const rawItems = getRichText(props, "items");
  let items: InvoiceItem[];
  try {
    const parsed: unknown = JSON.parse(rawItems);
    if (!Array.isArray(parsed)) throw new Error("items is not an array");
    items = parsed.map((x): InvoiceItem => {
      if (!x || typeof x !== "object") throw new Error("item is not an object");
      const o = x as Record<string, unknown>;
      if (
        typeof o.name !== "string" ||
        typeof o.qty !== "number" ||
        typeof o.unit_price !== "number"
      ) {
        throw new Error("item shape mismatch");
      }
      return { name: o.name, qty: o.qty, unitPrice: o.unit_price };
    });
  } catch (cause) {
    throw new InvoiceParseError(id, cause);
  }

  const statusRaw = getSelect(props, "status");
  const status: InvoiceStatus = isInvoiceStatus(statusRaw)
    ? statusRaw
    : "draft";

  return {
    id,
    invoiceNo: getTitle(props, "invoice_no"),
    clientName: getRichText(props, "client_name"),
    issuedAt: getDate(props, "issued_at"),
    expiresAt: getDate(props, "expires_at"),
    items,
    subtotal: getNumber(props, "subtotal") ?? 0,
    vat: getNumber(props, "vat") ?? 0,
    total: getNumber(props, "total") ?? 0,
    memo: getRichText(props, "memo") || null,
    accessToken: getRichText(props, "access_token"),
    status,
  };
}
