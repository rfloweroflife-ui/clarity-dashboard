import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Activity {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_updated' | 'project_created' | 'meeting_created' | 'comment_added';
  title: string;
  description: string;
  timestamp: string;
  user_id: string;
  user_name?: string;
  entity_id: string;
  entity_type: 'task' | 'project' | 'meeting' | 'comment';
}

export const useActivityFeed = (workspaceId: string | null, limit = 20) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!workspaceId || !user) return;

    setLoading(true);

    try {
      // Fetch recent tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status, created_at, updated_at, completed_at, creator_id')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      // Fetch recent projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, created_at, owner_id')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Fetch recent meetings
      const { data: meetings } = await supabase
        .from('meetings')
        .select('id, title, created_at, host_id')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Fetch recent comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, task_id')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Fetch user profiles for activity names
      const userIds = new Set<string>();
      tasks?.forEach((t) => t.creator_id && userIds.add(t.creator_id));
      projects?.forEach((p) => p.owner_id && userIds.add(p.owner_id));
      meetings?.forEach((m) => m.host_id && userIds.add(m.host_id));
      comments?.forEach((c) => userIds.add(c.user_id));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      // Build activities from all sources
      const allActivities: Activity[] = [];

      // Task activities
      tasks?.forEach((task) => {
        if (task.completed_at) {
          allActivities.push({
            id: `task-completed-${task.id}`,
            type: 'task_completed',
            title: 'Task Completed',
            description: task.title,
            timestamp: task.completed_at,
            user_id: task.creator_id || '',
            user_name: profileMap.get(task.creator_id || '') || undefined,
            entity_id: task.id,
            entity_type: 'task',
          });
        }

        allActivities.push({
          id: `task-created-${task.id}`,
          type: 'task_created',
          title: 'Task Created',
          description: task.title,
          timestamp: task.created_at!,
          user_id: task.creator_id || '',
          user_name: profileMap.get(task.creator_id || '') || undefined,
          entity_id: task.id,
          entity_type: 'task',
        });
      });

      // Project activities
      projects?.forEach((project) => {
        allActivities.push({
          id: `project-created-${project.id}`,
          type: 'project_created',
          title: 'Project Created',
          description: project.name,
          timestamp: project.created_at!,
          user_id: project.owner_id || '',
          user_name: profileMap.get(project.owner_id || '') || undefined,
          entity_id: project.id,
          entity_type: 'project',
        });
      });

      // Meeting activities
      meetings?.forEach((meeting) => {
        allActivities.push({
          id: `meeting-created-${meeting.id}`,
          type: 'meeting_created',
          title: 'Meeting Scheduled',
          description: meeting.title,
          timestamp: meeting.created_at!,
          user_id: meeting.host_id || '',
          user_name: profileMap.get(meeting.host_id || '') || undefined,
          entity_id: meeting.id,
          entity_type: 'meeting',
        });
      });

      // Comment activities
      comments?.forEach((comment) => {
        allActivities.push({
          id: `comment-added-${comment.id}`,
          type: 'comment_added',
          title: 'Comment Added',
          description: comment.content.length > 50 ? comment.content.slice(0, 50) + '...' : comment.content,
          timestamp: comment.created_at!,
          user_id: comment.user_id,
          user_name: profileMap.get(comment.user_id) || undefined,
          entity_id: comment.id,
          entity_type: 'comment',
        });
      });

      // Sort by timestamp and limit
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(allActivities.slice(0, limit));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user, limit]);

  useEffect(() => {
    if (user && workspaceId) {
      fetchActivities();

      // Subscribe to realtime changes for all relevant tables
      const channel = supabase
        .channel(`activity-${workspaceId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${workspaceId}` }, fetchActivities)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `workspace_id=eq.${workspaceId}` }, fetchActivities)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings', filter: `workspace_id=eq.${workspaceId}` }, fetchActivities)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `workspace_id=eq.${workspaceId}` }, fetchActivities)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, workspaceId, fetchActivities]);

  return {
    activities,
    loading,
    refetch: fetchActivities,
  };
};
