"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LineItem, ModifierResult } from "@/lib/engine";
import type { Money } from "@/lib/engine/money";
import type { Service } from "@/lib/schema/rates";
import type { Project } from "@/stores/project-store";

interface Branding {
  name: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  logoUrl: string | null;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#111",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  metaColumn: {
    flexDirection: "column",
    gap: 2,
  },
  label: {
    color: "#666",
    fontSize: 8,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  table: {
    width: "auto",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f9f9f9",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#111",
  },
  colDesc: { width: "60%" },
  colQty: { width: "15%", textAlign: "center" },
  colAmount: { width: "25%", textAlign: "right" },

  modifierRow: {
    flexDirection: "row",
    paddingVertical: 4,
    color: "#059669", // Success emerald color
    fontSize: 9,
  },

  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#111",
    alignItems: "flex-end",
    gap: 5,
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  warningPanel: {
    marginTop: 40,
    padding: 10,
    backgroundColor: "#fffbeb", // Warning amber background
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  warningText: {
    color: "#92400e",
    fontSize: 8,
    fontStyle: "italic",
  },
});

interface QuotePDFProps {
  project: Project;
  results: Array<{
    id: string;
    service: Service;
    lineItems: LineItem[];
    subtotal: Money;
    modifiers: ModifierResult[];
    total: Money;
  }>;
  totals: {
    subtotal: string;
    vat: string;
    grand: string;
  };
  branding: Branding;
}

export function QuotePDF({ project, results, totals, branding }: QuotePDFProps) {
  return (
    <Document title={`Quote - ${project.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
            {branding.logoUrl && (
              <Image src={branding.logoUrl} style={{ width: 40, height: 40, objectFit: "contain" }} />
            )}
            <View>
              <Text style={styles.title}>{branding.name || "Quote"}</Text>
              <Text style={{ color: "#666", fontSize: 8 }}>{branding.address}</Text>
              <Text style={{ color: "#666", fontSize: 8 }}>
                {branding.contact} {branding.email}
              </Text>
            </View>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={{ fontWeight: "bold" }}>#{project.id.slice(0, 8).toUpperCase()}</Text>
            <Text>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Client / Project Meta */}
        <View style={styles.metaSection}>
          <View style={styles.metaColumn}>
            <Text style={styles.label}>Project Name</Text>
            <Text style={{ fontSize: 12, fontWeight: "bold" }}>{project.name}</Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.label}>Prepared By</Text>
            <Text>{project.authorName || "Professional Engineer"}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.colDesc, { fontWeight: "bold" }]}>Description</Text>
            <Text style={[styles.colQty, { fontWeight: "bold" }]}>Qty</Text>
            <Text style={[styles.colAmount, { fontWeight: "bold" }]}>Amount</Text>
          </View>

          {results.map((res) => {
            const isGrouped = res.service.strategy === "time_based";
            const totalQty = res.lineItems.reduce((acc, li) => acc + li.quantity, 0);

            return (
              <View key={res.id} wrap={false}>
                <View style={styles.tableRow}>
                  <Text style={styles.colDesc}>{res.service.label}</Text>
                  <Text style={styles.colQty}>
                    {isGrouped ? totalQty : res.lineItems[0]?.quantity} {res.service.unit}
                  </Text>
                  <Text style={styles.colAmount}>{res.total.format()}</Text>
                </View>

                {/* Sub-items Breakdown */}
                {res.lineItems.map((li) => (
                  <View key={li.id} style={[styles.modifierRow, { color: "#666" }]}>
                    <Text style={styles.colDesc}> • {li.label}</Text>
                    <Text style={styles.colQty}>{li.quantity}</Text>
                    <Text style={styles.colAmount}>{li.formattedAmount}</Text>
                  </View>
                ))}

                {res.modifiers.map((mod) => (
                  <View key={mod.id} style={styles.modifierRow}>
                    <Text style={styles.colDesc}>
                      {" "}
                      + {mod.label}: {mod.optionLabel}
                    </Text>
                    <Text style={styles.colQty}></Text>
                    <Text style={styles.colAmount}>+{mod.formattedAmount}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 20 }}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={{ width: 80, textAlign: "right" }}>{totals.subtotal}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 20 }}>
            <Text style={styles.label}>VAT (12%)</Text>
            <Text style={{ width: 80, textAlign: "right" }}>{totals.vat}</Text>
          </View>
          <View style={[styles.grandTotal, { flexDirection: "row", justifyContent: "flex-end", gap: 20 }]}>
            <Text style={[styles.label, { fontSize: 10, marginTop: 4 }]}>Total Amount</Text>
            <Text style={{ width: 100, textAlign: "right" }}>{totals.grand}</Text>
          </View>
        </View>

        {/* Warnings */}
        <View style={styles.warningPanel}>
          <Text style={[styles.label, { marginBottom: 4, color: "#b45309" }]}>Important Notes</Text>
          <Text style={styles.warningText}>• This quote is valid for 30 days from the date of issue.</Text>
          <Text style={styles.warningText}>
            • Fees are based on user submitted rate schedules. Consult a professional for actual costs.
          </Text>
          <Text style={styles.warningText}>
            • Final project costs may vary based on actual field conditions and government verification fees.
          </Text>
        </View>

        {/* Footer */}
        <View
          style={{
            position: "absolute",
            bottom: 30,
            left: 40,
            right: 40,
            borderTop: 1,
            borderTopColor: "#eee",
            paddingTop: 10,
          }}
        >
          <Text style={{ textAlign: "center", color: "#999", fontSize: 7 }}>
            {branding.website
              ? `${branding.name} — ${branding.website}`
              : `Generated by Quotable — Local-first Schema-driven Engine.`}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
