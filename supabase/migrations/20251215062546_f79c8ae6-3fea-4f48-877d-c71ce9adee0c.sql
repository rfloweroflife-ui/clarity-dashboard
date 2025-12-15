-- Create labels table
CREATE TABLE public.labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, workspace_id)
);

-- Create task_labels junction table
CREATE TABLE public.task_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, label_id)
);

-- Enable RLS
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

-- Labels policies
CREATE POLICY "Members can view labels"
ON public.labels FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create labels"
ON public.labels FOR INSERT
WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can update labels"
ON public.labels FOR UPDATE
USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can delete labels"
ON public.labels FOR DELETE
USING (is_workspace_member(auth.uid(), workspace_id));

-- Task labels policies
CREATE POLICY "Members can view task labels"
ON public.task_labels FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_labels.task_id
  AND is_workspace_member(auth.uid(), t.workspace_id)
));

CREATE POLICY "Members can manage task labels"
ON public.task_labels FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_labels.task_id
  AND is_workspace_member(auth.uid(), t.workspace_id)
));