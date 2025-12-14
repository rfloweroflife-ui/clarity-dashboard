import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { ProjectCard } from '@/components/app/ProjectCard';
import { CreateProjectDialog } from '@/components/app/CreateProjectDialog';

const Projects = () => {
  const { currentWorkspace } = useWorkspace();
  const { projects, createProject, deleteProject } = useProjects(currentWorkspace?.id || null);
  const { tasks } = useTasks(currentWorkspace?.id || null);

  const getTaskCount = (projectId: string) => tasks.filter((t) => t.project_id === projectId).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">Organize your work into projects</p>
          </div>
          <CreateProjectDialog onCreateProject={createProject} />
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
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
