import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Project } from '@/hooks/useProjects';
import { ProjectKanbanCard } from './ProjectKanbanCard';
import { cn } from '@/lib/utils';

interface ProjectKanbanBoardProps {
  projects: Project[];
  getTaskCount: (projectId: string) => number;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  onDeleteProject: (id: string) => void;
}

const COLUMNS = [
  { id: 'active', title: 'Active', color: 'bg-success' },
  { id: 'paused', title: 'Paused', color: 'bg-warning' },
  { id: 'completed', title: 'Completed', color: 'bg-muted-foreground' },
  { id: 'archived', title: 'Archived', color: 'bg-muted-foreground' },
];

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  projects: Project[];
  getTaskCount: (projectId: string) => number;
  onDelete: (id: string) => void;
}

const KanbanColumn = ({ id, title, color, projects, getTaskCount, onDelete }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {projects.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-lg p-2 space-y-2 min-h-[200px] transition-colors',
          isOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'bg-muted/30'
        )}
      >
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectKanbanCard
              key={project.id}
              project={project}
              taskCount={getTaskCount(project.id)}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {projects.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            Drop projects here
          </div>
        )}
      </div>
    </div>
  );
};

export const ProjectKanbanBoard = ({
  projects,
  getTaskCount,
  onUpdateProject,
  onDeleteProject,
}: ProjectKanbanBoardProps) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getProjectsByStatus = (status: string) =>
    projects.filter((p) => p.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: handle drag over for visual feedback
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Check if dropped on a column
    const targetColumn = COLUMNS.find((col) => col.id === over.id);
    if (targetColumn && project.status !== targetColumn.id) {
      await onUpdateProject(projectId, { status: targetColumn.id });
      return;
    }

    // Check if dropped on another project (use that project's column)
    const targetProject = projects.find((p) => p.id === over.id);
    if (targetProject && project.status !== targetProject.status) {
      await onUpdateProject(projectId, { status: targetProject.status });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            projects={getProjectsByStatus(column.id)}
            getTaskCount={getTaskCount}
            onDelete={onDeleteProject}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject && (
          <div className="opacity-90">
            <ProjectKanbanCard
              project={activeProject}
              taskCount={getTaskCount(activeProject.id)}
              onDelete={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
