import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/hooks/useTasks';
import { TaskKanbanCard } from './TaskKanbanCard';
import { cn } from '@/lib/utils';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  onCompleteTask: (id: string) => Promise<Task | null>;
  onDeleteTask: (id: string) => Promise<boolean>;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-500' },
];

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const KanbanColumn = ({ id, title, color, tasks, onComplete, onDelete }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[300px] max-w-[350px] flex-1">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-lg p-2 space-y-2 min-h-[400px] transition-colors',
          isOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'bg-muted/30'
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskKanbanCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-muted rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export const TaskKanbanBoard = ({
  tasks,
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
}: TaskKanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getTasksByStatus = (status: string) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Check if dropped on a column
    const targetColumn = COLUMNS.find((col) => col.id === over.id);
    if (targetColumn && task.status !== targetColumn.id) {
      if (targetColumn.id === 'completed') {
        await onCompleteTask(taskId);
      } else {
        await onUpdateTask(taskId, { status: targetColumn.id });
      }
      return;
    }

    // Check if dropped on another task (use that task's column)
    const targetTask = tasks.find((t) => t.id === over.id);
    if (targetTask && task.status !== targetTask.status) {
      if (targetTask.status === 'completed') {
        await onCompleteTask(taskId);
      } else {
        await onUpdateTask(taskId, { status: targetTask.status });
      }
    }
  };

  const handleComplete = async (id: string) => {
    await onCompleteTask(id);
  };

  const handleDelete = async (id: string) => {
    await onDeleteTask(id);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={getTasksByStatus(column.id)}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-2">
            <TaskKanbanCard
              task={activeTask}
              onComplete={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
