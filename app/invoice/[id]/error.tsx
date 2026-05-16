"use client";

import { Button } from "@/components/ui/button";

export default function InvoiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isParse = error.name === "InvoiceParseError";
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-start gap-4 p-8">
      <h1 className="text-2xl font-semibold">
        {isParse
          ? "견적서 데이터를 읽을 수 없습니다"
          : "잠시 문제가 발생했습니다"}
      </h1>
      <p className="text-muted-foreground text-sm">
        {isParse
          ? "견적서 항목 형식에 오류가 있습니다. 작성자에게 문의해 주세요."
          : "견적서를 불러오는 중 일시적인 오류가 발생했습니다. 다시 시도해 주세요."}
      </p>
      <Button onClick={() => reset()}>다시 시도</Button>
    </main>
  );
}
