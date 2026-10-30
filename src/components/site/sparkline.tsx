import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <div className={className ?? "h-10 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="currentColor"
            strokeWidth={1.4}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
