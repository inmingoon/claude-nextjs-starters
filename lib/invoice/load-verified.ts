import "server-only";

import { verifyToken } from "@/lib/auth/verify-token";
import { logger } from "@/lib/logger";
import { getInvoiceById } from "@/lib/notion";
import type { Invoice } from "@/types/invoice";

/** 페이지·PDF Route 공통 로딩+토큰 검증. 실패 사유는 호출자에게 노출하지 않고 null 통일 — 토큰 누락/변조/row 부재가 동일 응답이 되도록 보장. */
export async function loadVerified(
  id: string,
  token: string | undefined,
): Promise<Invoice | null> {
  const invoice = await getInvoiceById(id);
  if (!invoice) return null;
  if (!token || !verifyToken(token, invoice.accessToken)) {
    logger.warn({ event: "token.denied", invoiceId: id });
    return null;
  }
  return invoice;
}
