/** Phase 4 PDF 엔진 Spike — @react-pdf/renderer로 한글 폰트 + 25 items 페이지 분할 PoC. ok/fail JSON 출력 + out.pdf 임시 생성. */
import fs from "node:fs";
import path from "node:path";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createElement as h } from "react";

Font.register({
  family: "Pretendard",
  src: path.join(process.cwd(), "public/fonts/Pretendard-Regular.otf"),
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Pretendard",
    fontSize: 10,
    lineHeight: 1.4,
  },
  title: { fontSize: 20, marginBottom: 12 },
  header: { marginBottom: 16 },
  rowHead: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: "1pt solid #333",
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: "0.5pt solid #ccc",
  },
  cell: { flex: 1 },
  cellRight: { flex: 1, textAlign: "right" },
});

const items = Array.from({ length: 60 }, (_, i) => ({
  name: `테스트 항목 ${i + 1}`,
  qty: i + 1,
  unitPrice: 100000 * (i + 1),
}));

const doc = h(
  Document,
  {},
  h(
    Page,
    { size: "A4", style: styles.page },
    h(
      View,
      { style: styles.header },
      h(Text, { style: styles.title }, "견적서 PoC — INV-PoC-001"),
      h(Text, {}, "클라이언트: 웹사이트 디자인 회사 (한글 검증용)"),
    ),
    h(
      View,
      { style: styles.rowHead },
      h(Text, { style: styles.cell }, "항목"),
      h(Text, { style: styles.cellRight }, "수량"),
      h(Text, { style: styles.cellRight }, "단가"),
      h(Text, { style: styles.cellRight }, "소계"),
    ),
    ...items.map((it, i) =>
      h(
        View,
        { key: i, style: styles.row, wrap: false },
        h(Text, { style: styles.cell }, it.name),
        h(Text, { style: styles.cellRight }, String(it.qty)),
        h(Text, { style: styles.cellRight }, String(it.unitPrice)),
        h(Text, { style: styles.cellRight }, String(it.qty * it.unitPrice)),
      ),
    ),
  ),
);

const buf = await renderToBuffer(doc);
const sig = buf.subarray(0, 4).toString("ascii");
const sizeKB = +(buf.length / 1024).toFixed(1);

const text = buf.toString("latin1");
const pageMatches = text.match(/\/Type\s*\/Page[^s]/g) || [];
const pageCount = pageMatches.length;

const ok = sig === "%PDF" && buf.length < 400000 && pageCount >= 2;

fs.writeFileSync("out.pdf", buf);

console.log(JSON.stringify({ sig, size: buf.length, sizeKB, pageCount, ok }));
process.exit(ok ? 0 : 1);
