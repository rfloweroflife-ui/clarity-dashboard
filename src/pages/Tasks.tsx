import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/app/TaskCard';
import { CreateTaskDialog } from '@/components/app/CreateTaskDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { useAIPrioritization } from '@/hooks/useAIPrioritization';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

const Tasks = () => {
  const { currentWorkspace } = useWorkspace();
  const { tasks, createTask, completeTask, deleteTask } = useTasks(currentWorkspace?.id || null);
  const { prioritizeTasks, isLoading, result, clearResult } = useAIPrioritization();

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Sort tasks by AI priority if available
  const sortedTodoTasks = useMemo(() => {
    if (!result?.prioritized_ids) return todoTasks;
    
    const priorityMap = new Map(result.prioritized_ids.map((id, index) => [id, index]));
    return [...todoTasks].sort((a, b) => {
      const aIndex = priorityMap.get(a.id) ?? 999;
      const bIndex = priorityMap.get(b.id) ?? 999;
      return aIndex - bIndex;
    });
  }, [todoTasks, result]);

  const handlePrioritize = async () => {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    await prioritizeTasks(incompleteTasks);
  };

  const isQuickWin = (taskId: string) => result?.quick_wins?.includes(taskId);
  const isUrgent = (taskId: string) => result?.urgent?.includes(taskId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage your tasks and stay productive</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handlePrioritize}
              disabled={isLoading || tasks.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Prioritize
            </Button>
            <CreateTaskDialog onCreateTask={createTask} />
          </div>
        </div>

        {result && (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">AI Insights</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearResult}>
                Dismiss
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{result.insights}</p>
            <div className="flex flex-wrap gap-2">
              {result.quick_wins && result.quick_wins.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {result.quick_wins.length} Quick wins
                </Badge>
              )}
              {result.urgent && result.urgent.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {result.urgent.length} Urgent
                </Badge>
              )}
            </div>
          </div>
        )}

        <Tabs defaultValue="todo" className="w-full">
          <TabsList>
            <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="todo" className="mt-6">
            <div className="grid gap-3">
              {sortedTodoTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks to do</p>
              ) : (
                sortedTodoTasks.map((task, index) => (
                  <div key={task.id} className="relative">
                    {result && (
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          #{index + 1}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <TaskCard task={task} onComplete={completeTask} onDelete={deleteTask} />
                      </div>
                      {isQuickWin(task.id) && (
                        <Badge variant="secondary" className="shrink-0">
                          <Zap className="h-3 w-3 mr-1" />
                          Quick
                        </Badge>
                      )}
                      {isUrgent(task.id) && (
                        <Badge variant="destructive" className="shrink-0">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
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
