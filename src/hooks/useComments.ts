import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  task_id: string | null;
  project_id: string | null;
  meeting_id: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithProfile extends Comment {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useComments = (workspaceId: string | null, taskId?: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!workspaceId || !taskId) {
      setLoading(false);
      return;
    }

    // Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      setLoading(false);
      return;
    }

    if (!commentsData || commentsData.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    // Get unique user IDs and fetch profiles
    const userIds = [...new Set(commentsData.map((c) => c.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    const profileMap = new Map(
      (profilesData || []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }])
    );

    const commentsWithProfiles: CommentWithProfile[] = commentsData.map((comment) => ({
      ...comment,
      profile: profileMap.get(comment.user_id),
    }));

    setComments(commentsWithProfiles);
    setLoading(false);
  }, [workspaceId, taskId]);

  useEffect(() => {
    if (user && workspaceId && taskId) {
      fetchComments();
    }
  }, [user, workspaceId, taskId, fetchComments]);

  const createComment = async (content: string) => {
    if (!workspaceId || !user || !taskId) return null;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: content.trim(),
        user_id: user.id,
        task_id: taskId,
        workspace_id: workspaceId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
      return null;
    }

    // Add profile info for current user
    const commentWithProfile: CommentWithProfile = {
      ...data,
      profile: {
        full_name: user.user_metadata?.full_name || user.email || 'You',
        avatar_url: null,
      },
    };

    setComments((prev) => [...prev, commentWithProfile]);
    return data;
  };

  const updateComment = async (id: string, content: string) => {
    const { data, error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
      });
      return null;
    }

    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: data.content } : c))
    );
    return data;
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
      return false;
    }

    setComments((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  return {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
};
