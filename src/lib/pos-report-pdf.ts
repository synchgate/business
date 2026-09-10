// POS period-summary report — same jsPDF + html2canvas pipeline as
// lib/pdf-receipt.ts (A4-width document, not the narrow till-receipt layout
// lib/sale-receipt.ts uses), built from the same PosAnalytics shape the
// Dashboard already renders.

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { PosAnalytics } from "@/types/pos";
import { formatDate, formatMoney } from "@/lib/format";

const colors = {
  surface: "#ffffff",
  surfaceMuted: "#e7eef6",
  ink: "#101728",
  body: "#4b5366",
  muted: "#8a93a6",
  line: "#dce3ed",
  primary: "#1849d6",
};

function buildReportHtml(analytics: PosAnalytics): string {
  const logoBlock = analytics.merchant_logo
    ? `<img src="${analytics.merchant_logo}" alt="${analytics.merchant_name}" style="height:40px;width:40px;border-radius:8px;object-fit:cover;" />`
    : `<div style="font-size:20px;font-weight:700;color:${colors.primary};letter-spacing:-0.02em;">${analytics.merchant_name || "Sales Report"}</div>`;

  const statBox = (label: string, value: string) => `
    <div style="flex:1;min-width:120px;padding:12px 14px;background:${colors.surfaceMuted};border-radius:8px;">
      <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};margin:0 0 4px;">${label}</p>
      <p style="font-size:16px;font-weight:600;color:${colors.ink};margin:0;">${value}</p>
    </div>`;

  const paymentRows = analytics.payment_breakdown
    .map(
      (p) => `
    <tr>
      <td style="padding:8px 12px;text-transform:capitalize;color:${colors.ink};font-size:12px;">${p.payment_method}</td>
      <td style="padding:8px 12px;text-align:right;font-family:'Courier New',monospace;font-size:12px;color:${colors.body};">${p.count}</td>
      <td style="padding:8px 12px;text-align:right;font-family:'Courier New',monospace;font-size:12px;color:${colors.ink};">${formatMoney(p.total)}</td>
    </tr>`,
    )
    .join("");

  const topProductRows = analytics.top_products
    .map(
      (p, i) => `
    <tr>
      <td style="padding:8px 12px;color:${colors.muted};font-size:12px;">${i + 1}</td>
      <td style="padding:8px 12px;color:${colors.ink};font-size:12px;">${p.item_name}</td>
      <td style="padding:8px 12px;text-align:right;font-family:'Courier New',monospace;font-size:12px;color:${colors.body};">${Number(p.quantity_sold)}</td>
      <td style="padding:8px 12px;text-align:right;font-family:'Courier New',monospace;font-size:12px;color:${colors.ink};">${formatMoney(p.revenue)}</td>
    </tr>`,
    )
    .join("");

  return `
    <div style="width:600px;background:${colors.surface};font-family:'Inter',Arial,sans-serif;padding:40px;box-sizing:border-box;">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:10px;">
          ${logoBlock}
          ${analytics.merchant_logo ? `<span style="font-size:15px;font-weight:600;color:${colors.ink};">${analytics.merchant_name}</span>` : ""}
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px;font-weight:700;color:${colors.ink};">Sales Report</div>
          <div style="font-size:11px;color:${colors.muted};margin-top:2px;">${formatDate(analytics.date_from)} – ${formatDate(analytics.date_to)}</div>
        </div>
      </div>

      <div style="height:1px;background:${colors.line};margin-bottom:20px;"></div>

      <!-- KPI row -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;">
        ${statBox("Total sales", String(analytics.total_sales))}
        ${statBox("Revenue", formatMoney(analytics.total_revenue))}
        ${statBox("Average sale", formatMoney(analytics.average_sale_value))}
        ${statBox("Items sold", String(Number(analytics.items_sold)))}
      </div>

      <!-- Payment breakdown -->
      <p style="font-size:12px;font-weight:600;color:${colors.ink};margin:0 0 8px;">Payment methods</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid ${colors.line};border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <thead>
          <tr style="background:${colors.surfaceMuted};">
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Method</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Sales</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Total</th>
          </tr>
        </thead>
        <tbody>${paymentRows || `<tr><td colspan="3" style="padding:12px;text-align:center;color:${colors.muted};font-size:12px;">No sales in this range.</td></tr>`}</tbody>
      </table>

      <!-- Top products -->
      <p style="font-size:12px;font-weight:600;color:${colors.ink};margin:0 0 8px;">Top products</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid ${colors.line};border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <thead>
          <tr style="background:${colors.surfaceMuted};">
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">#</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Item</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Revenue</th>
          </tr>
        </thead>
        <tbody>${topProductRows || `<tr><td colspan="4" style="padding:12px;text-align:center;color:${colors.muted};font-size:12px;">No sales in this range.</td></tr>`}</tbody>
      </table>

      <!-- Footer -->
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid ${colors.line};text-align:center;">
        <p style="font-size:10px;color:${colors.muted};margin:0;">Generated by Entacrest Business Suite · ebs.entacrest.com</p>
      </div>
    </div>
  `;
}

export async function generatePosReportPdf(analytics: PosAnalytics): Promise<void> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.zIndex = "-1";
  container.innerHTML = buildReportHtml(analytics);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let y = 0;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      y -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`sales-report-${analytics.date_from}-to-${analytics.date_to}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
