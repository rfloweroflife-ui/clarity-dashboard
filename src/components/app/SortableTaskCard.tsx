import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/hooks/useTasks';
import { Label } from '@/hooks/useLabels';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MoreHorizontal, Trash2, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { TaskTimer } from './TaskTimer';
import { AssigneeSelect } from './AssigneeSelect';
import { LabelBadge } from './LabelBadge';
import { LabelSelect } from './LabelSelect';
import { WorkspaceMember } from '@/hooks/useWorkspaceMembers';

interface SortableTaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAssign?: (taskId: string, userId: string | null) => void;
  onClick?: () => void;
  showDragHandle?: boolean;
  badges?: React.ReactNode;
  timerProps?: {
    isActive: boolean;
    activeStartTime?: string;
    totalSeconds: number;
    onStart: () => void;
    onStop: () => void;
  };
  members?: WorkspaceMember[];
  taskLabels?: Label[];
  allLabels?: Label[];
  onToggleLabel?: (taskId: string, labelId: string) => void;
  onCreateLabel?: (name: string, color: string) => Promise<Label | null>;
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
  urgent: 'bg-destructive text-destructive-foreground',
};

export const SortableTaskCard = ({
  task,
  onComplete,
  onDelete,
  onAssign,
  onClick,
  showDragHandle = true,
  badges,
  timerProps,
  members = [],
  taskLabels = [],
  allLabels = [],
  onToggleLabel,
  onCreateLabel,
}: SortableTaskCardProps) => {
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

  const isCompleted = task.status === 'completed';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-start gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all',
        isDragging && 'opacity-50 shadow-lg z-50',
        isCompleted && 'opacity-60'
      )}
    >
      {showDragHandle && (
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onComplete(task.id)}
        onClick={(e) => e.stopPropagation()}
        className="mt-1"
      />

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'font-medium text-foreground line-clamp-2',
              isCompleted && 'line-through'
            )}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            {badges}
            {allLabels.length > 0 && onToggleLabel && onCreateLabel && (
              <LabelSelect
                labels={allLabels}
                selectedLabelIds={taskLabels.map((l) => l.id)}
                onToggleLabel={(labelId) => onToggleLabel(task.id, labelId)}
                onCreateLabel={onCreateLabel}
                compact
              />
            )}
            {members.length > 0 && onAssign && (
              <AssigneeSelect
                members={members}
                assigneeId={task.assignee_id}
                onAssign={(userId) => onAssign(task.id, userId)}
                compact
              />
            )}
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
              <DropdownMenuContent align="end" className="bg-popover border border-border">
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
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {taskLabels.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {taskLabels.map((label) => (
                <LabelBadge key={label.id} label={label} size="sm" />
              ))}
            </div>
          )}
          
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

          {timerProps && (
            <div className="ml-auto">
              <TaskTimer
                taskId={task.id}
                isActive={timerProps.isActive}
                activeStartTime={timerProps.activeStartTime}
                totalSeconds={timerProps.totalSeconds}
                onStart={timerProps.onStart}
                onStop={timerProps.onStop}
                compact
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
