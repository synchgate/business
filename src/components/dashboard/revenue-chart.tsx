import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { InvoiceAnalytics } from "@/types/invoice";

export function RevenueChart({ data }: { data: InvoiceAnalytics["monthly_collections"] }) {
  const chartData = data.map((entry) => ({
    month: new Date(`${entry.month}-01`).toLocaleDateString("en-NG", { month: "short" }),
    total: entry.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-line)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--color-muted)"
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted)" width={40} />
        <Tooltip
          cursor={{ fill: "var(--color-surface-muted)" }}
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
