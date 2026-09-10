import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PosPaymentBreakdownEntry } from "@/types/pos";
import { formatMoney } from "@/lib/format";

const COLORS: Record<string, string> = {
  cash: "var(--color-primary)",
  other: "var(--color-status-viewed)",
};

export function PaymentMixChart({ data }: { data: PosPaymentBreakdownEntry[] }) {
  const chartData = data.map((entry) => ({
    name: entry.payment_method,
    value: Number(entry.total),
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "var(--color-muted)"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatMoney(Number(value))}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Text legend — the split needs to be legible without hovering, especially on mobile. */}
      <div className="space-y-1.5">
        {data.map((entry) => (
          <div key={entry.payment_method} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 capitalize text-[var(--color-body)]">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: COLORS[entry.payment_method] ?? "var(--color-muted)" }}
              />
              {entry.payment_method}
            </span>
            <span className="font-ledger text-[var(--color-ink)]">
              {formatMoney(entry.total)} · {entry.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
