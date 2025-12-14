import { Project } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

const statusColors = {
  active: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  completed: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground',
};

export const ProjectCard = ({ project, taskCount = 0, onDelete, onClick }: ProjectCardProps) => {
  return (
    <div
      className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: project.color || '#6366f1' }}
        />
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
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
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

      <div className="mt-3">
        <h3 className="font-semibold text-foreground text-lg">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <Badge
          variant="secondary"
          className={cn('text-xs', statusColors[project.status as keyof typeof statusColors])}
        >
          {project.status}
        </Badge>

        {project.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(project.due_date), 'MMM d, yyyy')}
          </div>
        )}

        <span className="text-xs text-muted-foreground ml-auto">{taskCount} tasks</span>
      </div>
    </div>
  );
};
