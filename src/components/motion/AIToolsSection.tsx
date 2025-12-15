import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, FolderKanban, FileText, Mic, Calendar, Workflow, Search, Bot, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tools = [
  { id: "tasks", label: "AI Tasks", icon: CheckSquare, route: "/tasks", description: "Smart task prioritization" },
  { id: "projects", label: "AI Projects", icon: FolderKanban, route: "/projects", description: "Automated project management" },
  { id: "docs", label: "AI Docs", icon: FileText, route: "/journal", description: "Intelligent documentation" },
  { id: "notetaker", label: "AI Notetaker", icon: Mic, route: "/meetings", description: "Meeting transcription & notes" },
  { id: "calendar", label: "AI Calendar", icon: Calendar, route: "/calendar", description: "Smart scheduling" },
  { id: "workflows", label: "AI Workflows", icon: Workflow, route: "/dashboard", description: "Automated workflows" },
  { id: "search", label: "AI Search", icon: Search, route: "/dashboard", description: "Intelligent search" },
  { id: "assistant", label: "AI Assistant", icon: Bot, route: "/dashboard", description: "Personal AI helper" },
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
  const navigate = useNavigate();
  const [selectedTools, setSelectedTools] = useState<string[]>(["tasks", "projects"]);
  const [activePhase, setActivePhase] = useState("Design");

  const toggleTool = (id: string) => {
    setSelectedTools(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleToolClick = (tool: typeof tools[0]) => {
    // Toggle selection
    toggleTool(tool.id);
  };

  const handleToolNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <section id="ai-tools" className="py-20 px-4 bg-background">
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
                    onClick={() => handleToolClick(tool)}
                    className={cn(
                      "feature-card flex items-center gap-3 text-left group relative",
                      isSelected && "active"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "font-medium text-sm block",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {tool.label}
                      </span>
                      <span className="text-xs text-muted-foreground truncate block">
                        {tool.description}
                      </span>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center",
                      isSelected ? "bg-primary border-primary" : "border-border"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Get Started Button */}
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={handleGetStarted}
                className="cta-button flex-1"
                disabled={selectedTools.length === 0}
              >
                Get Started with {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Quick access links */}
            {selectedTools.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Try now:</span>
                {selectedTools.slice(0, 3).map((toolId) => {
                  const tool = tools.find(t => t.id === toolId);
                  if (!tool) return null;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolNavigate(tool.route)}
                      className="text-xs text-primary hover:underline"
                    >
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            )}
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
                        "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                        activePhase === phase.name
                          ? "bg-card border-border"
                          : "bg-muted/50 border-transparent"
                      )}
                      onClick={() => navigate('/tasks')}
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

            {/* View all projects link */}
            <button
              onClick={() => navigate('/projects')}
              className="mt-6 w-full text-center text-sm text-primary hover:underline flex items-center justify-center gap-1"
            >
              View all projects
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
