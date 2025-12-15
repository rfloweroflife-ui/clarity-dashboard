import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  workspace_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
}

export const useTimeTracking = (workspaceId: string | null) => {
  const { user } = useAuth();
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
    } else {
      setEntries(data || []);
      // Find active entry (no end_time)
      const active = data?.find((e) => !e.end_time);
      setActiveEntry(active || null);
    }
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    if (user && workspaceId) {
      fetchEntries();
    }
  }, [user, workspaceId, fetchEntries]);

  const startTimer = async (taskId: string) => {
    if (!workspaceId || !user) return null;

    // Stop any active timer first
    if (activeEntry) {
      await stopTimer();
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        task_id: taskId,
        user_id: user.id,
        workspace_id: workspaceId,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting timer:', error);
      return null;
    }

    setActiveEntry(data);
    setEntries((prev) => [data, ...prev]);
    return data;
  };

  const stopTimer = async () => {
    if (!activeEntry) return null;

    const endTime = new Date();
    const startTime = new Date(activeEntry.start_time);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', activeEntry.id)
      .select()
      .single();

    if (error) {
      console.error('Error stopping timer:', error);
      return null;
    }

    setActiveEntry(null);
    setEntries((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    return data;
  };

  const getTaskTotalTime = (taskId: string) => {
    return entries
      .filter((e) => e.task_id === taskId && e.duration_seconds)
      .reduce((total, e) => total + (e.duration_seconds || 0), 0);
  };

  const getActiveTaskId = () => activeEntry?.task_id || null;

  return {
    entries,
    activeEntry,
    loading,
    startTimer,
    stopTimer,
    getTaskTotalTime,
    getActiveTaskId,
    refetch: fetchEntries,
  };
};
