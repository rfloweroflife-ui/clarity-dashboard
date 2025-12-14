import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  workspace_id: string;
  owner_id: string | null;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useProjects = (workspaceId: string | null) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && workspaceId) {
      fetchProjects();
    }
  }, [user, workspaceId]);

  const fetchProjects = async () => {
    if (!workspaceId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const createProject = async (project: Partial<Project>) => {
    if (!workspaceId || !user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name || 'Untitled Project',
        description: project.description,
        status: project.status || 'active',
        color: project.color || '#6366f1',
        start_date: project.start_date,
        due_date: project.due_date,
        workspace_id: workspaceId,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
      return null;
    }

    setProjects((prev) => [data, ...prev]);
    toast({
      title: 'Project Created',
      description: 'Your project has been created successfully.',
    });
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
      return null;
    }

    setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
      return false;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: 'Project Deleted',
      description: 'The project has been removed.',
    });
    return true;
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};
