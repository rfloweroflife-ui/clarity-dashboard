import { useState } from "react";
import { CheckSquare, FolderKanban, FileText, Mic, Calendar, Workflow, Search, Bot, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "tasks", label: "AI Tasks", icon: CheckSquare },
  { id: "projects", label: "AI Projects", icon: FolderKanban },
  { id: "docs", label: "AI Docs", icon: FileText },
  { id: "notetaker", label: "AI Notetaker", icon: Mic },
  { id: "calendar", label: "AI Calendar", icon: Calendar },
  { id: "workflows", label: "AI Workflows", icon: Workflow },
  { id: "search", label: "AI Search", icon: Search },
  { id: "assistant", label: "AI Assistant", icon: Bot },
];

const phases = [
  { name: "Strategy", color: "bg-brand-pink/20 text-brand-pink" },
  { name: "Design", color: "bg-success/20 text-success" },
  { name: "Development", color: "bg-brand-blue/20 text-brand-blue" },
];

const tasks = {
  Strategy: [
    "Define Project Goals & Objectives",
    "Research Audience & Competitors",
  ],
  Design: [
    "Design Wireframes For Key Pages",
    "Create Visual Design Concepts",
  ],
  Development: [
    "Set Up Website Framework & CMS",
    "Develop Frontend Pages & Layouts",
  ],
};

export function AIToolsSection() {
  const [selectedTools, setSelectedTools] = useState<string[]>(["tasks", "projects"]);
  const [activePhase, setActivePhase] = useState("Design");

  const toggleTool = (id: string) => {
    setSelectedTools(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Tool selector */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              What <span className="gradient-text">AI tools</span> would you like to use?
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={cn(
                      "feature-card flex items-center gap-3 text-left",
                      isSelected && "active"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {tool.label}
                    </span>
                    <div className={cn(
                      "w-4 h-4 rounded border ml-auto flex items-center justify-center",
                      isSelected ? "bg-primary border-primary" : "border-border"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side - Project visualization */}
          <div className="bg-card rounded-2xl border border-border p-6">
            {/* Phase tabs */}
            <div className="flex rounded-full bg-muted p-1 mb-6">
              {phases.map((phase) => (
                <button
                  key={phase.name}
                  onClick={() => setActivePhase(phase.name)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all",
                    activePhase === phase.name
                      ? phase.color
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {phase.name}
                </button>
              ))}
            </div>

            {/* Task cards */}
            <div className="space-y-8">
              {phases.map((phase, phaseIndex) => (
                <div key={phase.name} className="space-y-3">
                  {tasks[phase.name as keyof typeof tasks].map((task, taskIndex) => (
                    <div
                      key={task}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border",
                        activePhase === phase.name
                          ? "bg-card border-border"
                          : "bg-muted/50 border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        phase.color.replace('/20', '').replace('text-', 'bg-').split(' ')[0]
                      )}>
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm text-foreground">{task}</span>
                    </div>
                  ))}
                  {phaseIndex < phases.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-px h-6 bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}