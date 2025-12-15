-- Create time_entries table for tracking task time
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Members can view time entries"
ON public.time_entries FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create time entries"
ON public.time_entries FOR INSERT
WITH CHECK (is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update own time entries"
ON public.time_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries"
ON public.time_entries FOR DELETE
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);