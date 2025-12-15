import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { ProjectCard } from '@/components/app/ProjectCard';
import { ProjectKanbanBoard } from '@/components/app/ProjectKanbanBoard';
import { CreateProjectDialog } from '@/components/app/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Columns } from 'lucide-react';

const Projects = () => {
  const { currentWorkspace } = useWorkspace();
  const { projects, createProject, updateProject, deleteProject } = useProjects(currentWorkspace?.id || null);
  const { tasks } = useTasks(currentWorkspace?.id || null);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');

  const getTaskCount = (projectId: string) => tasks.filter((t) => t.project_id === projectId).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">Organize your work into projects</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="h-8 px-3"
              >
                <Columns className="h-4 w-4" />
              </Button>
            </div>
            <CreateProjectDialog onCreateProject={createProject} />
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <ProjectKanbanBoard
            projects={projects}
            getTaskCount={getTaskCount}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                taskCount={getTaskCount(project.id)}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Projects;
