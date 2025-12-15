import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Label {
  id: string;
  name: string;
  color: string;
  workspace_id: string;
  created_at: string;
}

export interface TaskLabel {
  id: string;
  task_id: string;
  label_id: string;
  created_at: string;
}

export const useLabels = (workspaceId: string | null) => {
  const { user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabels = useCallback(async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching labels:', error);
    } else {
      setLabels(data || []);
    }
  }, [workspaceId]);

  const fetchTaskLabels = useCallback(async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from('task_labels')
      .select('*');

    if (error) {
      console.error('Error fetching task labels:', error);
    } else {
      setTaskLabels(data || []);
    }
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    if (user && workspaceId) {
      fetchLabels();
      fetchTaskLabels();

      // Subscribe to realtime task_labels changes
      const channel = supabase
        .channel(`task-labels-${workspaceId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'task_labels',
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newTaskLabel = payload.new as TaskLabel;
              setTaskLabels((prev) => {
                if (prev.some((tl) => tl.id === newTaskLabel.id)) return prev;
                return [...prev, newTaskLabel];
              });
            } else if (payload.eventType === 'DELETE') {
              const deleted = payload.old as { id: string };
              setTaskLabels((prev) => prev.filter((tl) => tl.id !== deleted.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, workspaceId, fetchLabels, fetchTaskLabels]);

  const createLabel = async (name: string, color: string) => {
    if (!workspaceId || !user) return null;

    const { data, error } = await supabase
      .from('labels')
      .insert({
        name: name.trim(),
        color,
        workspace_id: workspaceId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating label:', error);
      toast({
        title: 'Error',
        description: 'Failed to create label',
        variant: 'destructive',
      });
      return null;
    }

    setLabels((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const deleteLabel = async (id: string) => {
    const { error } = await supabase.from('labels').delete().eq('id', id);

    if (error) {
      console.error('Error deleting label:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete label',
        variant: 'destructive',
      });
      return false;
    }

    setLabels((prev) => prev.filter((l) => l.id !== id));
    setTaskLabels((prev) => prev.filter((tl) => tl.label_id !== id));
    return true;
  };

  const addLabelToTask = async (taskId: string, labelId: string) => {
    const existing = taskLabels.find((tl) => tl.task_id === taskId && tl.label_id === labelId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, label_id: labelId })
      .select()
      .single();

    if (error) {
      console.error('Error adding label to task:', error);
      return null;
    }

    setTaskLabels((prev) => [...prev, data]);
    return data;
  };

  const removeLabelFromTask = async (taskId: string, labelId: string) => {
    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', labelId);

    if (error) {
      console.error('Error removing label from task:', error);
      return false;
    }

    setTaskLabels((prev) => prev.filter((tl) => !(tl.task_id === taskId && tl.label_id === labelId)));
    return true;
  };

  const getLabelsForTask = (taskId: string) => {
    const labelIds = taskLabels.filter((tl) => tl.task_id === taskId).map((tl) => tl.label_id);
    return labels.filter((l) => labelIds.includes(l.id));
  };

  return {
    labels,
    taskLabels,
    loading,
    createLabel,
    deleteLabel,
    addLabelToTask,
    removeLabelFromTask,
    getLabelsForTask,
    refetch: () => {
      fetchLabels();
      fetchTaskLabels();
    },
  };
};
