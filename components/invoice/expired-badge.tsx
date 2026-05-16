import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/types/invoice";

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ExpiredBadge({
  expiresAt,
}: {
  expiresAt: Invoice["expiresAt"];
}) {
  if (expiresAt >= todayYmd()) return null;
  return <Badge variant="destructive">만료됨</Badge>;
}
