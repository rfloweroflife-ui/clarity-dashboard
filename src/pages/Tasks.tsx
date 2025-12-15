import { useMemo, useCallback, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useLabels } from '@/hooks/useLabels';
import { SortableTaskCard } from '@/components/app/SortableTaskCard';
import { TaskCard } from '@/components/app/TaskCard';
import { CreateTaskDialog } from '@/components/app/CreateTaskDialog';
import { TaskDetailDialog } from '@/components/app/TaskDetailDialog';
import { TaskKanbanBoard } from '@/components/app/TaskKanbanBoard';
import { TaskReminders } from '@/components/app/TaskReminders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LabelBadge } from '@/components/app/LabelBadge';
import { Sparkles, Zap, AlertTriangle, Loader2, Filter, X, LayoutList, Kanban } from 'lucide-react';
import { useAIPrioritization } from '@/hooks/useAIPrioritization';

const Tasks = () => {
  const { currentWorkspace } = useWorkspace();
  const { tasks, createTask, updateTask, completeTask, deleteTask, reorderTasks } = useTasks(
    currentWorkspace?.id || null
  );
  const { prioritizeTasks, isLoading, result, clearResult } = useAIPrioritization();
  const { activeEntry, startTimer, stopTimer, getTaskTotalTime, getActiveTaskId } = useTimeTracking(
    currentWorkspace?.id || null
  );
  const { members } = useWorkspaceMembers(currentWorkspace?.id || null);
  const { labels, getLabelsForTask, addLabelToTask, removeLabelFromTask, createLabel } = useLabels(
    currentWorkspace?.id || null
  );

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterLabelIds, setFilterLabelIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return undefined;
    const member = members.find((m) => m.user_id === assigneeId);
    return member?.profile?.full_name || 'Unknown';
  };

  const toggleFilterLabel = (labelId: string) => {
    setFilterLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const clearFilters = () => setFilterLabelIds([]);

  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Filter tasks by selected labels
  const filterTasksByLabels = useCallback(
    (taskList: Task[]) => {
      if (filterLabelIds.length === 0) return taskList;
      return taskList.filter((task) => {
        const taskLabelIds = getLabelsForTask(task.id).map((l) => l.id);
        return filterLabelIds.some((filterId) => taskLabelIds.includes(filterId));
      });
    },
    [filterLabelIds, getLabelsForTask]
  );

  const handleAssign = useCallback(
    (taskId: string, userId: string | null) => {
      updateTask(taskId, { assignee_id: userId });
    },
    [updateTask]
  );

  const handleToggleLabel = useCallback(
    async (taskId: string, labelId: string) => {
      const taskLabels = getLabelsForTask(taskId);
      const hasLabel = taskLabels.some((l) => l.id === labelId);
      if (hasLabel) {
        await removeLabelFromTask(taskId, labelId);
      } else {
        await addLabelToTask(taskId, labelId);
      }
    },
    [getLabelsForTask, addLabelToTask, removeLabelFromTask]
  );

  const todoTasks = useMemo(
    () => filterTasksByLabels(tasks.filter((t) => t.status === 'todo').sort((a, b) => a.position - b.position)),
    [tasks, filterTasksByLabels]
  );
  const inProgressTasks = useMemo(
    () => filterTasksByLabels(tasks.filter((t) => t.status === 'in_progress').sort((a, b) => a.position - b.position)),
    [tasks, filterTasksByLabels]
  );
  const completedTasks = useMemo(
    () => filterTasksByLabels(tasks.filter((t) => t.status === 'completed')),
    [tasks, filterTasksByLabels]
  );

  // Sort by AI priority if available
  const sortedTodoTasks = useMemo(() => {
    if (!result?.prioritized_ids) return todoTasks;

    const priorityMap = new Map(result.prioritized_ids.map((id, index) => [id, index]));
    return [...todoTasks].sort((a, b) => {
      const aIndex = priorityMap.get(a.id) ?? 999;
      const bIndex = priorityMap.get(b.id) ?? 999;
      return aIndex - bIndex;
    });
  }, [todoTasks, result]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = sortedTodoTasks.findIndex((t) => t.id === active.id);
        const newIndex = sortedTodoTasks.findIndex((t) => t.id === over.id);

        const newOrder = arrayMove(sortedTodoTasks, oldIndex, newIndex);
        reorderTasks(newOrder.map((t) => t.id));
      }
    },
    [sortedTodoTasks, reorderTasks]
  );

  const handlePrioritize = async () => {
    const incompleteTasks = tasks.filter((t) => t.status !== 'completed');
    const prioritized = await prioritizeTasks(incompleteTasks);
    
    // Apply AI order to tasks
    if (prioritized?.prioritized_ids) {
      const todoIds = todoTasks.map(t => t.id);
      const prioritizedTodoIds = prioritized.prioritized_ids.filter(id => todoIds.includes(id));
      if (prioritizedTodoIds.length > 0) {
        reorderTasks(prioritizedTodoIds);
      }
    }
  };

  const isQuickWin = (taskId: string) => result?.quick_wins?.includes(taskId);
  const isUrgent = (taskId: string) => result?.urgent?.includes(taskId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              {viewMode === 'kanban' ? 'Drag tasks between columns' : 'Drag to reorder • AI prioritization available'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-1 px-2"
              >
                <LayoutList className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="gap-1 px-2"
              >
                <Kanban className="h-4 w-4" />
                Board
              </Button>
            </div>
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

        {/* Task Reminders Widget */}
        <TaskReminders tasks={tasks} />

        {/* Label Filters */}
        {labels.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filter:</span>
            </div>
            {labels.map((label) => {
              const isActive = filterLabelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  onClick={() => toggleFilterLabel(label.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-primary ring-offset-background'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: label.color,
                    color: getContrastColor(label.color),
                  }}
                >
                  {label.name}
                </button>
              );
            })}
            {filterLabelIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 gap-1">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        )}

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

        {viewMode === 'kanban' ? (
          <TaskKanbanBoard
            tasks={filterTasksByLabels(tasks)}
            onUpdateTask={updateTask}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
          />
        ) : (
          <Tabs defaultValue="todo" className="w-full">
            <TabsList>
              <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="todo" className="mt-6">
              {sortedTodoTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks to do</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedTodoTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid gap-3">
                      {sortedTodoTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onComplete={completeTask}
                          onDelete={deleteTask}
                          onAssign={handleAssign}
                          onClick={() => openTaskDetail(task)}
                          members={members}
                          taskLabels={getLabelsForTask(task.id)}
                          allLabels={labels}
                          onToggleLabel={handleToggleLabel}
                          onCreateLabel={createLabel}
                          badges={
                            <>
                              {isQuickWin(task.id) && (
                                <Badge variant="secondary" className="shrink-0 gap-1">
                                  <Zap className="h-3 w-3" />
                                  Quick
                                </Badge>
                              )}
                              {isUrgent(task.id) && (
                                <Badge variant="destructive" className="shrink-0 gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Urgent
                                </Badge>
                              )}
                            </>
                          }
                          timerProps={{
                            isActive: getActiveTaskId() === task.id,
                            activeStartTime: activeEntry?.start_time,
                            totalSeconds: getTaskTotalTime(task.id),
                            onStart: () => startTimer(task.id),
                            onStop: stopTimer,
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="mt-6">
              <div className="grid gap-3">
                {inProgressTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tasks in progress</p>
                ) : (
                  inProgressTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onDelete={deleteTask}
                    />
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
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onDelete={deleteTask}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {currentWorkspace && (
          <TaskDetailDialog
            task={selectedTask}
            open={detailOpen}
            onOpenChange={setDetailOpen}
            workspaceId={currentWorkspace.id}
            taskLabels={selectedTask ? getLabelsForTask(selectedTask.id) : []}
            assigneeName={getAssigneeName(selectedTask?.assignee_id || null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Tasks;
