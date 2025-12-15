import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Meeting {
  id: string;
  title: string;
  workspace_id: string;
  calendar_event_id: string | null;
  host_id: string | null;
  status: string;
  meeting_link: string | null;
  recording_url: string | null;
  user_notes: string | null;
  ai_notes: string | null;
  ai_summary: string | null;
  combined_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  user_id: string | null;
  email: string | null;
  status: string;
}

export const useMeetings = (workspaceId: string | null) => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && workspaceId) {
      fetchMeetings();
    }
  }, [user, workspaceId]);

  const fetchMeetings = async () => {
    if (!workspaceId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meetings',
        variant: 'destructive',
      });
    } else {
      setMeetings(data || []);
    }
    setLoading(false);
  };

  const createMeeting = async (meeting: Partial<Meeting>) => {
    if (!workspaceId || !user) return null;

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title: meeting.title || 'Untitled Meeting',
        workspace_id: workspaceId,
        host_id: user.id,
        status: meeting.status || 'scheduled',
        meeting_link: meeting.meeting_link,
        calendar_event_id: meeting.calendar_event_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meeting',
        variant: 'destructive',
      });
      return null;
    }

    setMeetings((prev) => [data, ...prev]);
    toast({
      title: 'Meeting Created',
      description: 'Your meeting has been scheduled.',
    });
    return data;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update meeting',
        variant: 'destructive',
      });
      return null;
    }

    setMeetings((prev) => prev.map((m) => (m.id === id ? data : m)));
    return data;
  };

  const deleteMeeting = async (id: string) => {
    const { error } = await supabase.from('meetings').delete().eq('id', id);

    if (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meeting',
        variant: 'destructive',
      });
      return false;
    }

    setMeetings((prev) => prev.filter((m) => m.id !== id));
    toast({
      title: 'Meeting Deleted',
      description: 'The meeting has been removed.',
    });
    return true;
  };

  const addNotes = async (id: string, notes: string) => {
    return updateMeeting(id, { user_notes: notes });
  };

  return {
    meetings,
    loading,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    addNotes,
    refetch: fetchMeetings,
  };
};
