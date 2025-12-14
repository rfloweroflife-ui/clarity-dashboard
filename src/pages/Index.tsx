import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HeroMetric } from "@/components/dashboard/HeroMetric";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AttentionItem } from "@/components/dashboard/AttentionItem";
import { SparkIndicator } from "@/components/dashboard/SparkIndicator";
import { JournalWidget } from "@/components/dashboard/JournalWidget";
import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";

const Index = () => {
  return (
    <div className="h-full bg-background p-4 md:p-6 lg:p-8 flex flex-col">
      {/* Header */}
      <div className="fade-in">
        <DashboardHeader />
      </div>

      {/* Main Grid - 3 Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 mt-6 min-h-0">
        {/* Left Column - Hero + Attention */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Hero Revenue */}
          <div className="glass-card flex-1 flex items-center justify-center p-6 fade-in-delay-1 glow-primary">
            <HeroMetric
              label="Today's Revenue"
              value="$847K"
              change={23.5}
              changeLabel="vs last week"
            />
          </div>

          {/* Attention Required */}
          <div className="fade-in-delay-2">
            <h2 className="metric-label mb-2">Requires Decision</h2>
            <AttentionItem
              type="opportunity"
              title="TikTok campaign overperforming"
              metric="+340%"
              description="Scale budget?"
            />
          </div>
        </div>

        {/* Center Column - Metrics Grid */}
        <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4 content-start">
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
          <div className="col-span-2 glass-card p-4 fade-in-delay-3">
            <h2 className="metric-label mb-3">System Health</h2>
            <div className="space-y-2">
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

        {/* Right Column - Calendar & Journal */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Schedule Calendar */}
          <div className="flex-1 fade-in-delay-2">
            <ScheduleCalendar />
          </div>

          {/* Journal */}
          <div className="fade-in-delay-3">
            <JournalWidget />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center fade-in-delay-3">
        <span className="text-muted-foreground/50 text-xs uppercase tracking-widest">
          Data refreshes every 5 minutes
        </span>
      </div>
    </div>
  );
};

export default Index;
