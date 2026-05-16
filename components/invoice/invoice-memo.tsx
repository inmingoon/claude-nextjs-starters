import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InvoiceMemo({ memo }: { memo: string | null }) {
  if (!memo) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">메모</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {memo}
        </p>
      </CardContent>
    </Card>
  );
}
