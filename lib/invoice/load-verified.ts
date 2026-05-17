import "server-only";

import { verifyToken } from "@/lib/auth/verify-token";
import { logger } from "@/lib/logger";
import { getInvoiceById, getInvoiceByNo } from "@/lib/notion";
import type { Invoice } from "@/types/invoice";

/** Notion page id 패턴(32 hex, dash optional). 그 외는 invoice_no로 간주. */
function isNotionPageIdLike(s: string): boolean {
  return /^[0-9a-f]{32}$/i.test(s.replace(/-/g, ""));
}

/**
 * 페이지·PDF Route 공통 로딩+토큰 검증. 실패 사유는 호출자에게 노출하지 않고 null 통일
 * — 토큰 누락/변조/row 부재가 동일 응답이 되도록 보장.
 *
 * 라우트 파라미터는 두 형식 모두 허용:
 * - Notion page id (32 hex, 어드민이 생성하는 공식 share URL)
 * - invoice_no (예: "INV-2025-001", 사람이 읽기 좋은 친화적 URL)
 *
 * 토큰 검증은 동일하게 적용된다 — 형식 변경은 식별자 표기일 뿐, 보안 모델은 무변경.
 */
export async function loadVerified(
  idOrNo: string,
  token: string | undefined,
): Promise<Invoice | null> {
  const invoice = isNotionPageIdLike(idOrNo)
    ? await getInvoiceById(idOrNo)
    : await getInvoiceByNo(idOrNo);
  if (!invoice) return null;
  if (!token || !verifyToken(token, invoice.accessToken)) {
    logger.warn({ event: "token.denied", invoiceId: invoice.id });
    return null;
  }
  return invoice;
}
