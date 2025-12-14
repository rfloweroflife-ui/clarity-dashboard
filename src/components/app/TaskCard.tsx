import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
  urgent: 'bg-destructive text-destructive-foreground',
};

export const TaskCard = ({ task, onComplete, onDelete, onClick }: TaskCardProps) => {
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all cursor-pointer',
        isCompleted && 'opacity-60'
      )}
      onClick={onClick}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onComplete(task.id)}
        onClick={(e) => e.stopPropagation()}
        className="mt-1"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'font-medium text-foreground line-clamp-2',
              isCompleted && 'line-through'
            )}
          >
            {task.title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge
            variant="secondary"
            className={cn('text-xs', priorityColors[task.priority as keyof typeof priorityColors])}
          >
            {task.priority}
          </Badge>

          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </div>
          )}

          {task.duration_minutes && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.duration_minutes}m
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
