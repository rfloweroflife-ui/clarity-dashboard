import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/app/TaskCard';
import { CreateTaskDialog } from '@/components/app/CreateTaskDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Tasks = () => {
  const { currentWorkspace } = useWorkspace();
  const { tasks, createTask, completeTask, deleteTask } = useTasks(currentWorkspace?.id || null);

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage your tasks and stay productive</p>
          </div>
          <CreateTaskDialog onCreateTask={createTask} />
        </div>

        <Tabs defaultValue="todo" className="w-full">
          <TabsList>
            <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="todo" className="mt-6">
            <div className="grid gap-3">
              {todoTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks to do</p>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="in_progress" className="mt-6">
            <div className="grid gap-3">
              {inProgressTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks in progress</p>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-3">
              {completedTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No completed tasks</p>
              ) : (
                completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Tasks;
