import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, CheckCircle2, Trash2, GripVertical, Clock, AlertCircle } from 'lucide-react';

interface TaskKanbanCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground border-muted',
};

export const TaskKanbanCard = ({ task, onComplete, onDelete }: TaskKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card border rounded-lg p-3 shadow-sm transition-all',
        isDragging && 'opacity-50 shadow-lg scale-105',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                'font-medium text-sm leading-tight',
                task.status === 'completed' && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn('text-xs capitalize px-1.5 py-0', priorityColors[task.priority])}
            >
              {task.priority}
            </Badge>

            {task.due_date && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs gap-1 px-1.5 py-0',
                  isOverdue && 'bg-destructive/10 text-destructive border-destructive/30',
                  isDueToday && !isOverdue && 'bg-warning/10 text-warning border-warning/30'
                )}
              >
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), 'MMM d')}
              </Badge>
            )}

            {task.duration_minutes && (
              <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                <Clock className="h-3 w-3" />
                {task.duration_minutes}m
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 pt-1">
            {task.status !== 'completed' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-success"
                onClick={() => onComplete(task.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
