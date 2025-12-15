import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project } from '@/hooks/useProjects';
import { GripVertical, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ProjectKanbanCardProps {
  project: Project;
  taskCount?: number;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

export const ProjectKanbanCard = ({
  project,
  taskCount = 0,
  onDelete,
  onClick,
}: ProjectKanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { type: 'project', project },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color || '#6366f1' }}
            />
            <h4 className="font-medium text-foreground text-sm truncate">{project.name}</h4>
          </div>

          {project.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {project.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(project.due_date), 'MMM d')}
              </div>
            )}
            <span>{taskCount} tasks</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
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
  );
};
