import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PosDailySales } from "@/types/pos";
import { formatMoney } from "@/lib/format";

export function PosTrendChart({ data }: { data: PosDailySales[] }) {
  const chartData = data.map((entry) => ({
    day: new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-NG", { weekday: "short", day: "numeric" }),
    total: Number(entry.total),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-line)" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="var(--color-muted)"
          interval="preserveStartEnd"
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted)" width={40} />
        <Tooltip
          cursor={{ fill: "var(--color-surface-muted)" }}
          formatter={(value) => formatMoney(Number(value))}
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
