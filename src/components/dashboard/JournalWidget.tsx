import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Save, Check } from "lucide-react";

interface JournalEntry {
  id: string;
  text: string;
  timestamp: Date;
}

export const JournalWidget = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: "1", text: "Focus on scaling TikTok campaign today. Review Q4 projections.", timestamp: new Date() }
  ]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!currentEntry.trim()) return;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text: currentEntry,
      timestamp: new Date()
    };
    
    setEntries([newEntry, ...entries].slice(0, 3));
    setCurrentEntry("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSave();
    }
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-primary" />
          <h3 className="metric-label">Quick Journal</h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {saved ? (
            <>
              <Check className="h-3 w-3 text-success" />
              <span className="text-success">Saved</span>
            </>
          ) : (
            <>
              <Save className="h-3 w-3" />
              <span>⌘ Enter</span>
            </>
          )}
        </button>
      </div>
      
      <Textarea
        value={currentEntry}
        onChange={(e) => setCurrentEntry(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind today?"
        className="flex-1 min-h-[80px] resize-none bg-secondary/30 border-border/50 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
      />
      
      {entries.length > 0 && (
        <div className="mt-3 space-y-2 max-h-[100px] overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/30 border border-border/30"
            >
              <p className="line-clamp-2">{entry.text}</p>
              <span className="text-[10px] text-muted-foreground/50 mt-1 block">
                {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
