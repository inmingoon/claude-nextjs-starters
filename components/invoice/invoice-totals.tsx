import { Separator } from "@/components/ui/separator";

const krw = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

export function InvoiceTotals({
  subtotal,
  vat,
  total,
}: {
  subtotal: number;
  vat: number;
  total: number;
}) {
  return (
    <div className="flex flex-col items-end gap-2 text-sm">
      <div className="flex w-full max-w-xs justify-between">
        <span className="text-muted-foreground">소계</span>
        <span>{krw.format(subtotal)}</span>
      </div>
      <div className="flex w-full max-w-xs justify-between">
        <span className="text-muted-foreground">부가세</span>
        <span>{krw.format(vat)}</span>
      </div>
      <Separator className="my-1 max-w-xs" />
      <div className="flex w-full max-w-xs justify-between text-xl font-bold">
        <span>합계</span>
        <span>{krw.format(total)}</span>
      </div>
    </div>
  );
}
