import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HeroMetric } from "@/components/dashboard/HeroMetric";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AttentionItem } from "@/components/dashboard/AttentionItem";
import { SparkIndicator } from "@/components/dashboard/SparkIndicator";

const Index = () => {
  return (
    <div className="h-full bg-background p-6 md:p-8 lg:p-10 flex flex-col">
      {/* Header */}
      <div className="fade-in">
        <DashboardHeader />
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 mt-8 min-h-0">
        {/* Left Column - Hero Metric */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Hero Revenue */}
          <div className="glass-card flex-1 flex items-center justify-center p-8 fade-in-delay-1 glow-primary">
            <HeroMetric
              label="Today's Revenue"
              value="$847K"
              change={23.5}
              changeLabel="vs last week"
            />
          </div>

          {/* Attention Required */}
          <div className="fade-in-delay-3">
            <h2 className="metric-label mb-3">Requires Decision</h2>
            <AttentionItem
              type="opportunity"
              title="TikTok campaign overperforming"
              metric="+340%"
              description="Scale budget? Current ROAS: 4.2x"
            />
          </div>
        </div>

        {/* Right Column - Metrics Grid */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6 content-start">
          {/* Row 1 */}
          <MetricCard
            label="Gross Margin"
            value="68.4%"
            change={2.1}
            changeLabel="vs target"
            className="fade-in-delay-1"
            highlight
          />
          <MetricCard
            label="Cash Position"
            value="$4.2M"
            change={-8.3}
            changeLabel="burn rate"
            className="fade-in-delay-1"
          />

          {/* Row 2 */}
          <MetricCard
            label="CAC"
            value="$12.40"
            change={-15.2}
            changeLabel="improving"
            className="fade-in-delay-2"
          />
          <MetricCard
            label="LTV:CAC"
            value="5.8x"
            change={0.4}
            changeLabel="ratio"
            className="fade-in-delay-2"
          />

          {/* Health Indicators */}
          <div className="col-span-2 glass-card p-5 fade-in-delay-3">
            <h2 className="metric-label mb-4">System Health</h2>
            <div className="space-y-3">
              <SparkIndicator
                label="Inventory levels"
                value="42 days"
                status="healthy"
              />
              <SparkIndicator
                label="Fulfillment rate"
                value="98.7%"
                status="healthy"
              />
              <SparkIndicator
                label="Return rate"
                value="4.2%"
                status="warning"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Minimal */}
      <div className="mt-6 text-center fade-in-delay-3">
        <span className="text-muted-foreground/50 text-xs uppercase tracking-widest">
          Data refreshes every 5 minutes
        </span>
      </div>
    </div>
  );
};

export default Index;
