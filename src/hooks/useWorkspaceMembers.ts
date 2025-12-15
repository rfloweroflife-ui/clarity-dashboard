import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useWorkspaceMembers = (workspaceId: string | null) => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId]);

  const fetchMembers = async () => {
    if (!workspaceId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        id,
        user_id,
        role,
        profile:profiles!workspace_members_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('Error fetching workspace members:', error);
      // Fallback: fetch without join
      const { data: membersOnly } = await supabase
        .from('workspace_members')
        .select('id, user_id, role')
        .eq('workspace_id', workspaceId);
      
      if (membersOnly) {
        // Fetch profiles separately
        const userIds = membersOnly.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        const membersWithProfiles = membersOnly.map(m => ({
          ...m,
          profile: profiles?.find(p => p.id === m.user_id) || null
        }));
        setMembers(membersWithProfiles);
      }
    } else {
      // Handle the case where profile might be an array
      const normalizedMembers = (data || []).map(member => ({
        ...member,
        profile: Array.isArray(member.profile) ? member.profile[0] : member.profile
      }));
      setMembers(normalizedMembers);
    }
    setLoading(false);
  };

  const getMemberById = (userId: string) => {
    return members.find(m => m.user_id === userId);
  };

  return {
    members,
    loading,
    getMemberById,
    refetch: fetchMembers,
  };
};
