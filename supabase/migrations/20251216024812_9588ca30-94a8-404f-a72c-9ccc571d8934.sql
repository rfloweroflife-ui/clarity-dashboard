-- Step 1: Drop all policies that depend on the old functions

-- calendar_events policies
DROP POLICY IF EXISTS "Members can view calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Members can create calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Members can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Members can delete calendar events" ON public.calendar_events;

-- comments policies
DROP POLICY IF EXISTS "Members can view comments" ON public.comments;
DROP POLICY IF EXISTS "Members can create comments" ON public.comments;

-- labels policies
DROP POLICY IF EXISTS "Members can view labels" ON public.labels;
DROP POLICY IF EXISTS "Members can create labels" ON public.labels;
DROP POLICY IF EXISTS "Members can update labels" ON public.labels;
DROP POLICY IF EXISTS "Members can delete labels" ON public.labels;

-- meetings policies
DROP POLICY IF EXISTS "Members can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Members can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Members can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Members can delete meetings" ON public.meetings;

-- projects policies
DROP POLICY IF EXISTS "Members can view projects" ON public.projects;
DROP POLICY IF EXISTS "Members can create projects" ON public.projects;
DROP POLICY IF EXISTS "Members can update projects" ON public.projects;
DROP POLICY IF EXISTS "Members can delete projects" ON public.projects;

-- tasks policies
DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can delete tasks" ON public.tasks;

-- time_entries policies
DROP POLICY IF EXISTS "Members can view time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Members can create time entries" ON public.time_entries;

-- workspace_members policies
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;

-- workspaces policies
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;

-- action_items policies
DROP POLICY IF EXISTS "Members can manage action items" ON public.action_items;

-- task_dependencies policies
DROP POLICY IF EXISTS "Members can manage task dependencies" ON public.task_dependencies;

-- task_labels policies
DROP POLICY IF EXISTS "Members can manage task labels" ON public.task_labels;
DROP POLICY IF EXISTS "Members can view task labels" ON public.task_labels;

-- meeting_attendees policies
DROP POLICY IF EXISTS "Attendees can update own status" ON public.meeting_attendees;
DROP POLICY IF EXISTS "Attendees can view own record" ON public.meeting_attendees;
DROP POLICY IF EXISTS "Hosts can view all attendees" ON public.meeting_attendees;

-- Step 2: Drop old functions (now safe since policies are removed)
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.is_workspace_member(uuid, uuid);

-- Step 3: Create new hardened functions that use auth.uid() directly
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = auth.uid() AND workspace_id = _workspace_id
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _workspace_id AND owner_id = auth.uid()
  )
$$;

-- Step 4: Restrict execute permissions
REVOKE ALL ON FUNCTION public.has_role(app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;

-- Step 5: Recreate all policies with new function signatures

-- calendar_events policies
CREATE POLICY "Members can view calendar events" ON public.calendar_events
FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create calendar events" ON public.calendar_events
FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update calendar events" ON public.calendar_events
FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can delete calendar events" ON public.calendar_events
FOR DELETE USING (is_workspace_member(workspace_id));

-- comments policies
CREATE POLICY "Members can view comments" ON public.comments
FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create comments" ON public.comments
FOR INSERT WITH CHECK (is_workspace_member(workspace_id) AND auth.uid() = user_id);

-- labels policies
CREATE POLICY "Members can view labels" ON public.labels
FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create labels" ON public.labels
FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update labels" ON public.labels
FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can delete labels" ON public.labels
FOR DELETE USING (is_workspace_member(workspace_id));

-- meetings policies
CREATE POLICY "Members can view meetings" ON public.meetings
FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create meetings" ON public.meetings
FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update meetings" ON public.meetings
FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can delete meetings" ON public.meetings
FOR DELETE USING (is_workspace_member(workspace_id));

-- projects policies
CREATE POLICY "Members can view projects" ON public.projects
FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create projects" ON public.projects
FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update projects" ON public.projects
FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can delete projects" ON public.projects
FOR DELETE USING (is_workspace_member(workspace_id));

-- tasks policies
CREATE POLICY "Members can view tasks" ON public.tasks
FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create tasks" ON public.tasks
FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update tasks" ON public.tasks
FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can delete tasks" ON public.tasks
FOR DELETE USING (is_workspace_member(workspace_id));

-- time_entries policies
CREATE POLICY "Members can view time entries" ON public.time_entries
FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create time entries" ON public.time_entries
FOR INSERT WITH CHECK (is_workspace_member(workspace_id) AND auth.uid() = user_id);

-- workspace_members policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members
FOR SELECT USING (is_workspace_member(workspace_id));

-- workspaces policies
CREATE POLICY "Users can view workspaces they own or are members of" ON public.workspaces
FOR SELECT USING (owner_id = auth.uid() OR is_workspace_member(id));

-- action_items policies
CREATE POLICY "Members can manage action items" ON public.action_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = action_items.meeting_id AND is_workspace_member(m.workspace_id)
  )
);

-- task_dependencies policies
CREATE POLICY "Members can manage task dependencies" ON public.task_dependencies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_dependencies.task_id AND is_workspace_member(t.workspace_id)
  )
);

-- task_labels policies
CREATE POLICY "Members can manage task labels" ON public.task_labels
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_labels.task_id AND is_workspace_member(t.workspace_id)
  )
);

CREATE POLICY "Members can view task labels" ON public.task_labels
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_labels.task_id AND is_workspace_member(t.workspace_id)
  )
);

-- meeting_attendees policies
CREATE POLICY "Attendees can update own status" ON public.meeting_attendees
FOR UPDATE USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id AND is_workspace_member(m.workspace_id)
  )
);

CREATE POLICY "Attendees can view own record" ON public.meeting_attendees
FOR SELECT USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id AND is_workspace_member(m.workspace_id)
  )
);

CREATE POLICY "Hosts can view all attendees" ON public.meeting_attendees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id AND is_workspace_member(m.workspace_id) AND m.host_id = auth.uid()
  )
);