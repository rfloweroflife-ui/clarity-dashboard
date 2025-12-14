import { ListTodo, FolderKanban, FileText, Calendar, Mic, Search, Workflow, User, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const oldTools = [
  { icon: ListTodo, label: "Normal Task Manager", description: "Endless lists, missed deadlines, forgotten tasks" },
  { icon: FolderKanban, label: "Normal Project Manager", description: "Requires babysitting and hours of daily, manual work" },
  { icon: FileText, label: "Normal Docs", description: "Waste hours on drafting, reviewing, proofreading. Disorganized." },
  { icon: Calendar, label: "Normal Calendar", description: "Lots of conflicts, never enough time" },
  { icon: Mic, label: "Normal Meetings", description: "Take notes manually, miss important details" },
  { icon: Search, label: "Normal Search", description: "Spend hours a week finding stuff" },
  { icon: Workflow, label: "Normal Workflows", description: "Long SOPs that are difficult to follow" },
  { icon: User, label: "Normal Busywork", description: "Spend 90% of time on repetitive work" },
];

const aiTools = [
  { icon: ListTodo, label: "AI Task Planner", description: "Automatically creates and prioritizes tasks" },
  { icon: FolderKanban, label: "AI Project Manager", description: "Generates projects in seconds and manages statuses for you" },
  { icon: FileText, label: "AI Docs Assistant", description: "Drafts and proofreads in seconds. Organizes itself." },
  { icon: Calendar, label: "AI Calendar Assistant", description: "Plans your day for you and schedules meetings automatically" },
  { icon: Mic, label: "AI Meeting Notetaker", description: "Takes perfect notes and follows-up with action items for you" },
  { icon: Search, label: "AI Search Assistant", description: "Instantly finds anything - docs, notes, project, task, communication" },
  { icon: Workflow, label: "AI Workflow Builder", description: "Automatically builds workflows based on SOPs" },
  { icon: User, label: "AI Personal Assistant", description: "Focus on real work, let AI handle repetitive stuff" },
];

export function ComparisonSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Stop using tech from the pre-AI era
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Old tools */}
          <div>
            <h3 className="font-display text-xl font-semibold text-muted-foreground mb-6 flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              Your existing, average tools
            </h3>
            <div className="space-y-3">
              {oldTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
                    <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">{tool.label}</h4>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI tools */}
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Motion's AI
            </h3>
            <div className="space-y-3">
              {aiTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <Icon className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">{tool.label}</h4>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button className="cta-button text-lg px-8 py-6 h-auto">
            Try Motion for free
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Start your free trial. Cancel in 1 click.
          </p>
        </div>
      </div>
    </section>
  );
}