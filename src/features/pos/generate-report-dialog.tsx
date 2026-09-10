import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadPosSalesExport, getPosAnalyticsForRange } from "@/api/endpoints/pos";
import { generatePosReportPdf } from "@/lib/pos-report-pdf";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: isoDate(from), to: isoDate(to) };
}

type Pending = "csv" | "xlsx" | "pdf" | null;

export function GenerateReportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [{ from, to }, setRange] = useState(defaultRange);
  const [pending, setPending] = useState<Pending>(null);

  const rangeValid = !!from && !!to && to >= from;

  async function handleExport(format: "csv" | "xlsx") {
    if (!rangeValid) return;
    setPending(format);
    try {
      await downloadPosSalesExport(from, to, format);
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't generate the export."),
      );
    } finally {
      setPending(null);
    }
  }

  async function handlePdfSummary() {
    if (!rangeValid) return;
    setPending("pdf");
    try {
      const analytics = await getPosAnalyticsForRange(from, to);
      await generatePosReportPdf(analytics);
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't generate the report."),
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Generate report</DialogTitle>
          <DialogDescription>Export sales for a date range, or download a printable summary.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="report_from">From</Label>
              <Input
                id="report_from"
                type="date"
                value={from}
                max={to}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report_to">To</Label>
              <Input
                id="report_to"
                type="date"
                value={to}
                min={from}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              />
            </div>
          </div>
          {!rangeValid && <p className="text-xs text-[var(--color-status-overdue)]">End date must be on or after the start date.</p>}

          <div className="space-y-2">
            <div>
              <Label className="mb-1.5 block text-xs text-[var(--color-muted)]">Line-item export</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={!rangeValid || pending !== null}
                  onClick={() => handleExport("csv")}
                >
                  {pending === "csv" ? "Preparing…" : "Download CSV"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={!rangeValid || pending !== null}
                  onClick={() => handleExport("xlsx")}
                >
                  {pending === "xlsx" ? "Preparing…" : "Download Excel"}
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-[var(--color-muted)]">Summary</Label>
              <Button
                type="button"
                className="w-full"
                disabled={!rangeValid || pending !== null}
                onClick={handlePdfSummary}
              >
                {pending === "pdf" ? "Generating…" : "Download PDF summary"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
