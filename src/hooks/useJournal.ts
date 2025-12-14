import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface JournalEntry {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export const useJournal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journal entries:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const createEntry = async (content: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        content,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save journal entry',
        variant: 'destructive',
      });
      return null;
    }

    setEntries((prev) => [data, ...prev]);
    toast({
      title: 'Entry Saved',
      description: 'Your journal entry has been saved.',
    });
    return data;
  };

  const updateEntry = async (id: string, content: string) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ content })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update journal entry',
        variant: 'destructive',
      });
      return null;
    }

    setEntries((prev) => prev.map((e) => (e.id === id ? data : e)));
    return data;
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete journal entry',
        variant: 'destructive',
      });
      return false;
    }

    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast({
      title: 'Entry Deleted',
      description: 'The journal entry has been removed.',
    });
    return true;
  };

  return {
    entries,
    loading,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
};
