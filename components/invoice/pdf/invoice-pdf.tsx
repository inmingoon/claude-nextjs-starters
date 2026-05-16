import "server-only";

import path from "node:path";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { Invoice } from "@/types/invoice";

Font.register({
  family: "Pretendard",
  src: path.join(process.cwd(), "public/fonts/Pretendard-Regular.otf"),
});

const krw = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Pretendard",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#111",
  },
  header: { marginBottom: 16 },
  title: { fontSize: 22, marginBottom: 6 },
  meta: { fontSize: 10, marginBottom: 2, color: "#444" },
  tableHead: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    marginTop: 12,
    fontSize: 11,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  cellName: { flex: 3 },
  cellNumber: { flex: 1, textAlign: "right" },
  totals: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 2,
  },
  totalsLabel: { color: "#444" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#111",
    fontSize: 13,
  },
  memo: {
    marginTop: 24,
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#ccc",
    fontSize: 9,
    color: "#444",
  },
});

export function InvoicePdf({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{invoice.invoiceNo}</Text>
          <Text style={styles.meta}>클라이언트: {invoice.clientName}</Text>
          <Text style={styles.meta}>
            발행일: {invoice.issuedAt} | 유효기간: {invoice.expiresAt}
          </Text>
        </View>
        <View style={styles.tableHead}>
          <Text style={styles.cellName}>항목</Text>
          <Text style={styles.cellNumber}>수량</Text>
          <Text style={styles.cellNumber}>단가</Text>
          <Text style={styles.cellNumber}>소계</Text>
        </View>
        {invoice.items.map((item, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.cellName}>{item.name}</Text>
            <Text style={styles.cellNumber}>{item.qty}</Text>
            <Text style={styles.cellNumber}>{krw.format(item.unitPrice)}</Text>
            <Text style={styles.cellNumber}>
              {krw.format(item.qty * item.unitPrice)}
            </Text>
          </View>
        ))}
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>소계</Text>
            <Text>{krw.format(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>부가세</Text>
            <Text>{krw.format(invoice.vat)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text>합계</Text>
            <Text>{krw.format(invoice.total)}</Text>
          </View>
        </View>
        {invoice.memo && (
          <View style={styles.memo}>
            <Text>{invoice.memo}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
