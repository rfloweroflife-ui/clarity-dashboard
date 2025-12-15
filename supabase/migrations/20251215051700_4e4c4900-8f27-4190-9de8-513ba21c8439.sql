-- Fix 1: Allow workspace members to see each other's profiles for collaboration
CREATE POLICY "Workspace members can view other members profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm1
    JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid() AND wm2.user_id = profiles.id
  )
);

-- Fix 2: Replace broad meeting_attendees policy with granular policies
-- First drop the existing overly permissive policy
DROP POLICY IF EXISTS "Members can manage meeting attendees" ON public.meeting_attendees;

-- Allow workspace members to view attendees for meetings in their workspace
CREATE POLICY "Members can view meeting attendees"
ON public.meeting_attendees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND is_workspace_member(auth.uid(), m.workspace_id)
  )
);

-- Only meeting hosts can add/update/delete attendees
CREATE POLICY "Meeting hosts can manage attendees"
ON public.meeting_attendees
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND m.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND m.host_id = auth.uid()
  )
);