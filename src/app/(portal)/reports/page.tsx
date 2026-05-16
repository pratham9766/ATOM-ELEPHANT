import { SectionPage } from "@/components/layout/section-page";

export default function ReportsPage() {
  return (
    <SectionPage
      title="Reports"
      description="Export achievement reports (CSV/Excel) and async generation for large orgs."
      hint="Connect to GET /api/v1/reports/achievement when Celery export is enabled."
    />
  );
}
