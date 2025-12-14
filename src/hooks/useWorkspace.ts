import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export const useWorkspace = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  const fetchWorkspaces = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching workspaces:', error);
      return;
    }

    setWorkspaces(data || []);
    if (data && data.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(data[0]);
    }
    setLoading(false);
  };

  const selectWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  return {
    workspaces,
    currentWorkspace,
    loading,
    selectWorkspace,
    refetch: fetchWorkspaces,
  };
};
