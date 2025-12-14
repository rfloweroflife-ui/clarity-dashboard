import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarClock, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  date: Date;
  color: "primary" | "accent" | "warning";
}

export const ScheduleCalendar = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [events, setEvents] = useState<ScheduleEvent[]>([
    { id: "1", title: "Board Call", time: "10:00", date: today, color: "primary" },
    { id: "2", title: "Review Metrics", time: "14:00", date: today, color: "accent" },
    { id: "3", title: "TikTok Strategy", time: "16:00", date: today, color: "warning" },
  ]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("09:00");

  const selectedDateEvents = events.filter(
    (event) => event.date.toDateString() === selectedDate?.toDateString()
  );

  const datesWithEvents = events.map((event) => event.date);

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;
    
    const colors: ("primary" | "accent" | "warning")[] = ["primary", "accent", "warning"];
    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      time: newEventTime,
      date: selectedDate,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    
    setEvents([...events, newEvent]);
    setNewEventTitle("");
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const colorClasses = {
    primary: "bg-primary/20 border-primary/40 text-primary",
    accent: "bg-accent/20 border-accent/40 text-accent",
    warning: "bg-warning/20 border-warning/40 text-warning",
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h3 className="metric-label">Schedule</h3>
        </div>
        <button
          onClick={() => setIsAddingEvent(!isAddingEvent)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Calendar */}
        <div className="flex-shrink-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="p-0 pointer-events-auto"
            classNames={{
              months: "flex flex-col",
              month: "space-y-2",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-xs font-medium text-foreground",
              nav: "space-x-1 flex items-center",
              nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center",
              nav_button_previous: "absolute left-0",
              nav_button_next: "absolute right-0",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[10px]",
              row: "flex w-full mt-1",
              cell: "h-7 w-7 text-center text-xs p-0 relative focus-within:relative focus-within:z-20",
              day: cn(
                "h-7 w-7 p-0 font-normal text-xs rounded-md hover:bg-muted/50 transition-colors",
                "aria-selected:bg-primary aria-selected:text-primary-foreground"
              ),
              day_today: "bg-accent/30 text-accent-foreground font-medium",
              day_outside: "text-muted-foreground/30",
              day_disabled: "text-muted-foreground/30",
              day_hidden: "invisible",
            }}
            modifiers={{
              hasEvent: datesWithEvents,
            }}
            modifiersClassNames={{
              hasEvent: "after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full",
            }}
          />
        </div>

        {/* Events List */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="text-xs text-muted-foreground mb-2">
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>

          {isAddingEvent && (
            <div className="flex gap-2 mb-2">
              <input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                className="bg-secondary/50 border border-border/50 rounded px-2 py-1 text-xs w-20"
              />
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                placeholder="Event title"
                className="flex-1 bg-secondary/50 border border-border/50 rounded px-2 py-1 text-xs placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>
          )}

          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {selectedDateEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 italic">No events scheduled</p>
            ) : (
              selectedDateEvents
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg border text-xs transition-all hover:scale-[1.02]",
                      colorClasses[event.color]
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-70">{event.time}</span>
                    <span className="flex-1 truncate">{event.title}</span>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
