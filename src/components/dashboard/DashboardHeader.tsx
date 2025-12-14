import { format } from "date-fns";

export function DashboardHeader() {
  const now = new Date();
  const formattedDate = format(now, "EEEE, MMMM d");
  const formattedTime = format(now, "h:mm a");

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Command Center</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Real-time business health</p>
      </div>
      
      <div className="text-right">
        <p className="text-muted-foreground text-sm">{formattedDate}</p>
        <p className="text-foreground font-display font-medium">{formattedTime}</p>
      </div>
    </header>
  );
}
