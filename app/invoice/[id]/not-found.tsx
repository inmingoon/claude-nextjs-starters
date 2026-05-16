import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function InvoiceNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-start gap-4 p-8">
      <h1 className="text-2xl font-semibold">접근할 수 없는 링크</h1>
      <p className="text-muted-foreground text-sm">
        이 링크는 만료되었거나 잘못되었습니다.
      </p>
      <Button asChild variant="secondary">
        <Link href="/">홈으로</Link>
      </Button>
    </main>
  );
}
