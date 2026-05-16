import type { Metadata } from "next";
import { FileText, Link2, Send, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layouts/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Step = {
  no: string;
  title: string;
  description: string;
  icon: typeof FileText;
};

const steps: Step[] = [
  {
    no: "01",
    title: "Notion에 견적서 작성",
    description:
      "지정된 데이터베이스에 클라이언트명·항목·금액·만료일을 입력하면 access_token이 자동으로 채워집니다.",
    icon: FileText,
  },
  {
    no: "02",
    title: "상태를 sent로 변경",
    description:
      "Notion row의 status 필드를 sent로 바꾸면 견적서가 공유 가능 상태로 전환됩니다.",
    icon: Send,
  },
  {
    no: "03",
    title: "토큰 링크 공유",
    description:
      "/invoice/<id>?token=<access_token> 형식의 URL을 클라이언트에게 보내면 회원가입 없이 즉시 열람·PDF 다운로드가 가능합니다.",
    icon: Link2,
  },
];

/** 견적서 토큰 링크가 있어야 접근 가능한 발행자용 안내 페이지. */
export default function HomePage() {
  return (
    <Container className="py-16 sm:py-24">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          견적서 뷰어
        </h1>
        <p className="text-muted-foreground mt-4 text-base text-balance sm:text-lg">
          Notion으로 작성한 견적서를 토큰 링크 하나로 클라이언트에게 공유합니다.
          수신자는 회원가입 없이 열람하고 PDF로 보관할 수 있습니다.
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3">
        {steps.map(({ no, title, description, icon: Icon }) => (
          <Card key={no}>
            <CardHeader>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-semibold tracking-widest">
                  {no}
                </span>
                <Icon className="text-primary size-5" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="border-border bg-muted/40 mx-auto mt-10 max-w-2xl rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
          <p className="text-muted-foreground text-sm">
            이 사이트는 발행자가 보낸 견적서 링크로만 접근할 수 있습니다. 링크
            없이 도착한 화면이라면 발행자에게 재요청해 주세요.
          </p>
        </div>
      </section>
    </Container>
  );
}
