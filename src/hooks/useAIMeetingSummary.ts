import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SummaryResult {
  summary: string;
  key_points: string[];
  decisions?: string[];
  action_items?: { task: string; owner?: string }[];
  follow_ups?: string[];
}

export const useAIMeetingSummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const { toast } = useToast();

  const summarizeMeeting = async (meetingId: string, notes: string, title: string) => {
    if (!notes || notes.trim().length === 0) {
      toast({
        title: "No notes to summarize",
        description: "Add some meeting notes first.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-summarize-meeting', {
        body: { meetingId, notes, title },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.summary);
      toast({
        title: "Summary generated",
        description: "AI has analyzed your meeting notes.",
      });

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Could not generate summary. Please try again.";
      console.error('AI summarization error:', error);
      toast({
        title: "Summarization failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => setResult(null);

  return {
    summarizeMeeting,
    isLoading,
    result,
    clearResult,
  };
};
