import { Task } from '@/hooks/useTasks';
import { Label } from '@/hooks/useLabels';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TaskComments } from './TaskComments';
import { LabelBadge } from './LabelBadge';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
  urgent: 'bg-destructive text-destructive-foreground',
};

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  taskLabels?: Label[];
  assigneeName?: string;
}

export const TaskDetailDialog = ({
  task,
  open,
  onOpenChange,
  workspaceId,
  taskLabels = [],
  assigneeName,
}: TaskDetailDialogProps) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground pr-6">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Labels */}
          {taskLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {taskLabels.map((label) => (
                <LabelBadge key={label.id} label={label} />
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-3">
            <Badge
              variant="secondary"
              className={cn('text-xs', priorityColors[task.priority as keyof typeof priorityColors])}
            >
              {task.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {task.status}
            </Badge>

            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </div>
            )}

            {task.duration_minutes && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.duration_minutes} min
              </div>
            )}

            {assigneeName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {assigneeName}
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <TaskComments workspaceId={workspaceId} taskId={task.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
