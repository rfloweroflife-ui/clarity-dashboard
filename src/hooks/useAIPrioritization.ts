import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  due_date?: string | null;
  do_date?: string | null;
  status?: string | null;
  duration_minutes?: number | null;
  project_id?: string | null;
}

interface PrioritizationResult {
  prioritized_ids: string[];
  insights: string;
  quick_wins?: string[];
  urgent?: string[];
}

export const useAIPrioritization = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PrioritizationResult | null>(null);
  const { toast } = useToast();

  const prioritizeTasks = async (tasks: Task[]) => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to prioritize",
        description: "Add some tasks first to use AI prioritization.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-prioritize-tasks', {
        body: { tasks },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast({
        title: "Tasks prioritized",
        description: "AI has analyzed and reordered your tasks.",
      });

      return data as PrioritizationResult;
    } catch (error: any) {
      console.error('AI prioritization error:', error);
      toast({
        title: "Prioritization failed",
        description: error.message || "Could not prioritize tasks. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => setResult(null);

  return {
    prioritizeTasks,
    isLoading,
    result,
    clearResult,
  };
};
