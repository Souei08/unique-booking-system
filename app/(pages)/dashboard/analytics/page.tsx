import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import { AnalyticsDashboard } from "@/app/_features/analytics/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <ContentLayout
      title="Revenue Analytics"
      description="View revenue statistics and analytics across all products and tours."
    >
      <AnalyticsDashboard />
    </ContentLayout>
  );
}
