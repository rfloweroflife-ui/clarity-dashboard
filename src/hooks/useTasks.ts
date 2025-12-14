import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  do_date: string | null;
  duration_minutes: number | null;
  completed_at: string | null;
  workspace_id: string;
  project_id: string | null;
  assignee_id: string | null;
  creator_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export const useTasks = (workspaceId: string | null) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && workspaceId) {
      fetchTasks();
    }
  }, [user, workspaceId]);

  const fetchTasks = async () => {
    if (!workspaceId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const createTask = async (task: Partial<Task>) => {
    if (!workspaceId || !user) return null;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title || 'Untitled Task',
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date,
        do_date: task.do_date,
        duration_minutes: task.duration_minutes,
        workspace_id: workspaceId,
        creator_id: user.id,
        assignee_id: user.id,
        position: task.position || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
      return null;
    }

    setTasks((prev) => [...prev, data]);
    toast({
      title: 'Task Created',
      description: 'Your task has been added successfully.',
    });
    return data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
      return null;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
      return false;
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: 'Task Deleted',
      description: 'The task has been removed.',
    });
    return true;
  };

  const completeTask = async (id: string) => {
    return updateTask(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refetch: fetchTasks,
  };
};
