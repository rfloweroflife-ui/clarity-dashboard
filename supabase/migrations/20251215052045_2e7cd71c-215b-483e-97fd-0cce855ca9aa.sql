-- Drop current policy and create a more secure one
DROP POLICY IF EXISTS "Hosts and self can view meeting attendees" ON public.meeting_attendees;

-- Create a stricter policy: hosts must be workspace members, and self-view also requires workspace membership
CREATE POLICY "Workspace members can view meeting attendees"
ON public.meeting_attendees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND is_workspace_member(auth.uid(), m.workspace_id)
    AND (
      m.host_id = auth.uid() 
      OR meeting_attendees.user_id = auth.uid()
    )
  )
);