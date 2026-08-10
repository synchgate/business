import { useState } from "react";
import { FileBarChart, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequirePermission } from "@/components/team/require-permission";
import { useTaxReports } from "@/hooks/use-compliance";
import { formatDate, formatMoney } from "@/lib/format";
import { TAX_REPORT_TYPE_LABEL } from "@/types/compliance";
import { GenerateReportForm } from "@/features/compliance/generate-report-form";

export function ReportsList() {
  const [showGenerate, setShowGenerate] = useState(false);
  const { data: reports, isLoading, isError, refetch } = useTaxReports();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RequirePermission code="tax.report.generate">
          <Button onClick={() => setShowGenerate(true)}>
            <Plus className="size-4" />
            Generate report
          </Button>
        </RequirePermission>
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-2 px-5 py-5">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load tax reports." onRetry={() => refetch()} />
          ) : !reports || reports.length === 0 ? (
            <EmptyState
              icon={FileBarChart}
              title="No reports generated yet"
              description="Generate a VAT, PAYE, or pension report to see totals for a period."
              action={{ label: "Generate report", onClick: () => setShowGenerate(true) }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Taxable amount</TableHead>
                  <TableHead>Tax computed</TableHead>
                  <TableHead>Generated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge>{TAX_REPORT_TYPE_LABEL[r.report_type]}</Badge>
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">
                      {formatDate(r.period_start)} – {formatDate(r.period_end)}
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatMoney(r.total_taxable_amount)}</TableCell>
                    <TableCell className="font-medium text-[var(--color-ink)]">{formatMoney(r.total_tax_computed)}</TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatDate(r.generated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate tax report</DialogTitle>
            <DialogDescription>
              Pulls straight from your invoices and payroll — nothing to enter manually.
            </DialogDescription>
          </DialogHeader>
          <GenerateReportForm
            onSuccess={() => {
              setShowGenerate(false);
              refetch();
            }}
            onCancel={() => setShowGenerate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
