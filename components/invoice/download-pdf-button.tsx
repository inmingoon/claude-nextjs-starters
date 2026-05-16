import { Button } from "@/components/ui/button";

export function DownloadPdfButton({
  invoiceId,
  token,
}: {
  invoiceId: string;
  token: string;
}) {
  const href = `/api/invoice/${invoiceId}/pdf?token=${encodeURIComponent(token)}`;
  return (
    <Button asChild>
      <a href={href} download>
        PDF 다운로드
      </a>
    </Button>
  );
}
