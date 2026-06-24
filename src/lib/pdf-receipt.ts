// Receipt PDF generator using jsPDF + html2canvas
// Renders a temporary DOM node and captures it as a PDF.

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { InvoiceDetail } from "@/types/invoice";
import type { VirtualAccount } from "@/types/virtual-account";
import type { SettlementAccount } from "@/types/auth";
import { formatDate, formatMoney } from "@/lib/format";

interface PaymentInfo {
  virtualAccount: VirtualAccount | null;
  settlementAccount: SettlementAccount | null;
}

function buildReceiptHtml(invoice: InvoiceDetail, paymentInfo: PaymentInfo): string {
  const { virtualAccount, settlementAccount } = paymentInfo;
  // note: always renders in light theme for print

  // Colors — always use light theme for print
  const colors = {
    canvas: "#f0f5fa",
    surface: "#ffffff",
    surfaceMuted: "#e7eef6",
    ink: "#101728",
    body: "#4b5366",
    muted: "#8a93a6",
    line: "#dce3ed",
    primary: "#1849d6",
    paid: "#138a5e",
  };

  const bankSection = (() => {
    if (virtualAccount) {
      return `
        <div style="margin-top:20px;padding:14px 16px;background:${colors.surfaceMuted};border-radius:8px;">
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${colors.muted};margin:0 0 8px;">Virtual Account</p>
          <p style="font-size:13px;font-weight:600;color:${colors.ink};margin:0 0 2px;">${virtualAccount.account_name}</p>
          <p style="font-size:13px;color:${colors.body};margin:0 0 2px;">${virtualAccount.bank_name}</p>
          <p style="font-size:14px;font-family:'Courier New',monospace;font-weight:600;color:${colors.ink};margin:0;">${virtualAccount.dedicated_account_number}</p>
        </div>`;
    }
    if (settlementAccount) {
      return `
        <div style="margin-top:20px;padding:14px 16px;background:${colors.surfaceMuted};border-radius:8px;">
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${colors.muted};margin:0 0 8px;">Settlement Account</p>
          <p style="font-size:13px;font-weight:600;color:${colors.ink};margin:0 0 2px;">${settlementAccount.account_name}</p>
          <p style="font-size:13px;color:${colors.body};margin:0 0 2px;">${settlementAccount.bank_name}</p>
          <p style="font-size:14px;font-family:'Courier New',monospace;font-weight:600;color:${colors.ink};margin:0;">${settlementAccount.account_number}</p>
        </div>`;
    }
    return "";
  })();

  const itemRows = invoice.items.map(item => `
    <tr>
      <td style="padding:8px 12px;color:${colors.ink};font-size:12px;">${item.item_name}${item.description ? `<br/><span style="font-size:11px;color:${colors.muted};">${item.description}</span>` : ""}</td>
      <td style="padding:8px 12px;text-align:right;font-family:'Courier New',monospace;font-size:12px;color:${colors.body};">${item.quantity}</td>
      <td style="padding:8px 12px;text-align:right;font-family:'Courier New',monospace;font-size:12px;color:${colors.body};">${formatMoney(item.unit_price, invoice.currency)}</td>
      <td style="padding:8px 12px;text-align:right;font-family:'Courier New',monospace;font-size:12px;color:${colors.ink};">${formatMoney(item.amount, invoice.currency)}</td>
    </tr>
  `).join("");

  const isPaid = invoice.status === "paid";
  const statusColor = isPaid ? colors.paid : "#c8801a";
  const statusLabel = isPaid ? "PAID" : "PARTIALLY PAID";

  return `
    <div style="width:600px;background:${colors.surface};font-family:'Inter',Arial,sans-serif;padding:40px;box-sizing:border-box;">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;">
        <div>
          <div style="font-size:20px;font-weight:700;color:${colors.primary};letter-spacing:-0.02em;">Synchgate</div>
          <div style="font-size:11px;color:${colors.muted};margin-top:2px;">invoice.synchgate.com</div>
        </div>
        <div style="text-align:right;">
          <div style="display:inline-block;background:${statusColor}18;color:${statusColor};font-size:10px;font-weight:700;letter-spacing:0.08em;padding:4px 10px;border-radius:20px;margin-bottom:6px;">${statusLabel}</div>
          <div style="font-family:'Courier New',monospace;font-size:14px;font-weight:600;color:${colors.ink};">${invoice.invoice_number}</div>
        </div>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:${colors.line};margin-bottom:24px;"></div>

      <!-- Billed to / Dates -->
      <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
        <div>
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${colors.muted};margin:0 0 6px;">Billed to</p>
          <p style="font-size:13px;font-weight:600;color:${colors.ink};margin:0 0 2px;">${invoice.customer_name}</p>
          <p style="font-size:12px;color:${colors.body};margin:0;">${invoice.customer_email}</p>
          ${invoice.customer_phone ? `<p style="font-size:12px;color:${colors.body};margin:2px 0 0;">${invoice.customer_phone}</p>` : ""}
        </div>
        <div style="text-align:right;">
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${colors.muted};margin:0 0 6px;">Dates</p>
          <p style="font-size:12px;color:${colors.body};margin:0 0 2px;">Issued: ${formatDate(invoice.issue_date)}</p>
          <p style="font-size:12px;color:${colors.body};margin:0;">Due: ${formatDate(invoice.due_date)}</p>
          ${invoice.paid_at ? `<p style="font-size:12px;color:${colors.paid};margin:4px 0 0;font-weight:600;">Paid: ${formatDate(invoice.paid_at)}</p>` : ""}
        </div>
      </div>

      <!-- Items table -->
      <table style="width:100%;border-collapse:collapse;border:1px solid ${colors.line};border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <thead>
          <tr style="background:${colors.surfaceMuted};">
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Item</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Unit price</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${colors.muted};">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
        <div style="width:220px;">
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:${colors.body};">
            <span>Subtotal</span><span style="font-family:'Courier New',monospace;">${formatMoney(invoice.subtotal, invoice.currency)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:${colors.body};">
            <span>Discount</span><span style="font-family:'Courier New',monospace;">−${formatMoney(invoice.discount, invoice.currency)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:${colors.body};">
            <span>Tax</span><span style="font-family:'Courier New',monospace;">+${formatMoney(invoice.tax, invoice.currency)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0 4px;font-size:14px;font-weight:600;color:${colors.ink};border-top:1px solid ${colors.line};margin-top:4px;">
            <span>Total</span><span style="font-family:'Courier New',monospace;">${formatMoney(invoice.total_amount, invoice.currency)}</span>
          </div>
          ${Number(invoice.amount_paid) > 0 ? `
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;font-weight:600;color:${colors.paid};">
            <span>Paid</span><span style="font-family:'Courier New',monospace;">${formatMoney(invoice.amount_paid, invoice.currency)}</span>
          </div>` : ""}
        </div>
      </div>

      <!-- Bank account -->
      ${bankSection}

      <!-- Notes / Terms -->
      ${invoice.notes || invoice.terms ? `
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid ${colors.line};display:flex;gap:24px;">
          ${invoice.notes ? `<div style="flex:1;"><p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${colors.muted};margin:0 0 4px;">Notes</p><p style="font-size:12px;color:${colors.body};margin:0;">${invoice.notes}</p></div>` : ""}
          ${invoice.terms ? `<div style="flex:1;"><p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${colors.muted};margin:0 0 4px;">Terms</p><p style="font-size:12px;color:${colors.body};margin:0;">${invoice.terms}</p></div>` : ""}
        </div>` : ""}

      <!-- Footer -->
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid ${colors.line};text-align:center;">
        <p style="font-size:10px;color:${colors.muted};margin:0;">Generated by Synchgate · invoice.synchgate.com</p>
      </div>
    </div>
  `;
}

export async function generateReceiptPdf(
  invoice: InvoiceDetail,
  paymentInfo: PaymentInfo,
): Promise<void> {
  // Build a temporary hidden element
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.zIndex = "-1";
  container.innerHTML = buildReceiptHtml(invoice, paymentInfo);
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

    pdf.save(`receipt-${invoice.invoice_number}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

// For print/pdf of invoice (window.print wrapper that injects bank details)
export function printInvoice(): void {
  window.print();
}
