import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskTimerProps {
  taskId: string;
  isActive: boolean;
  activeStartTime?: string;
  totalSeconds: number;
  onStart: () => void;
  onStop: () => void;
  compact?: boolean;
}

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTotalTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

export const TaskTimer = ({
  taskId,
  isActive,
  activeStartTime,
  totalSeconds,
  onStart,
  onStop,
  compact = false,
}: TaskTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive || !activeStartTime) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(activeStartTime).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [isActive, activeStartTime]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant={isActive ? 'destructive' : 'ghost'}
          size="icon"
          className={cn('h-6 w-6', !isActive && 'hover:bg-primary/10 hover:text-primary')}
          onClick={handleClick}
        >
          {isActive ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        {isActive ? (
          <span className="text-xs font-mono text-primary animate-pulse">
            {formatTime(elapsed)}
          </span>
        ) : totalSeconds > 0 ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTotalTime(totalSeconds)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <Button
        variant={isActive ? 'destructive' : 'default'}
        size="sm"
        onClick={handleClick}
        className="gap-1.5"
      >
        {isActive ? (
          <>
            <Square className="h-3.5 w-3.5" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" />
            Start
          </>
        )}
      </Button>

      <div className="flex flex-col">
        {isActive && (
          <span className="text-sm font-mono font-semibold text-primary">
            {formatTime(elapsed)}
          </span>
        )}
        {totalSeconds > 0 && (
          <span className="text-xs text-muted-foreground">
            Total: {formatTotalTime(totalSeconds)}
          </span>
        )}
      </div>
    </div>
  );
};
