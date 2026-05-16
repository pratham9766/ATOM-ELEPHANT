import { OrgHealthRadar } from "@/components/charts/org-health-radar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RadarMetric } from "@/types/dashboard";

export function OrgHealthCard({ data }: { data: RadarMetric[] }) {
  return (
    <Card className="min-h-[296px]">
      <CardHeader>
        <CardTitle>Org Health Radar Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <OrgHealthRadar data={data} />
      </CardContent>
    </Card>
  );
}
