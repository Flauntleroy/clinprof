import PageBreadcrumb from "@/components/dashboard/common/PageBreadcrumb";
import ComponentCard from "@/components/dashboard/common/ComponentCard";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import PageMeta from "@/components/dashboard/common/PageMeta";

export default function BarChart() {
  return (
    <div>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}



