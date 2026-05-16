import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricPill } from "@/components/shared/metric-pill";
import type { TrendPoint } from "@/types/dashboard";

export function AnalyticsCard({ data }: { data: TrendPoint[] }) {
  return (
    <Card className="min-h-[232px]">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <MetricPill label="QoQ delta" value="+18.4%" tone="text-emerald-200" />
      </CardHeader>
      <CardContent>
        <TrendLineChart data={data} />
      </CardContent>
    </Card>
  );
}
