import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  location: string | null;
  color: string;
  recurrence_rule: string | null;
  user_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export const useCalendarEvents = (workspaceId: string | null) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && workspaceId) {
      fetchEvents();
    }
  }, [user, workspaceId]);

  const fetchEvents = async () => {
    if (!workspaceId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const createEvent = async (event: Partial<CalendarEvent>) => {
    if (!workspaceId || !user) return null;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title || 'Untitled Event',
        description: event.description,
        start_time: event.start_time!,
        end_time: event.end_time!,
        is_all_day: event.is_all_day || false,
        location: event.location,
        color: event.color || '#6366f1',
        recurrence_rule: event.recurrence_rule,
        workspace_id: workspaceId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
      return null;
    }

    setEvents((prev) => [...prev, data]);
    toast({
      title: 'Event Created',
      description: 'Your event has been scheduled.',
    });
    return data;
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
      return null;
    }

    setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
    return data;
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
      return false;
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast({
      title: 'Event Deleted',
      description: 'The event has been removed.',
    });
    return true;
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
};
