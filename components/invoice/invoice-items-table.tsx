import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceItem } from "@/types/invoice";

const krw = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

export function InvoiceItemsTable({ items }: { items: InvoiceItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>항목</TableHead>
          <TableHead className="text-right">수량</TableHead>
          <TableHead className="text-right">단가</TableHead>
          <TableHead className="text-right">소계</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, i) => (
          <TableRow key={`${item.name}-${i}`}>
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right">{item.qty}</TableCell>
            <TableCell className="text-right">
              {krw.format(item.unitPrice)}
            </TableCell>
            <TableCell className="text-right">
              {krw.format(item.qty * item.unitPrice)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
