-- Drop current SELECT policy
DROP POLICY IF EXISTS "Workspace members can view meeting attendees" ON public.meeting_attendees;

-- Create stricter policy: only hosts can see full attendee details (including email)
-- Attendees can only see their own record
CREATE POLICY "Hosts can view all attendees"
ON public.meeting_attendees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND is_workspace_member(auth.uid(), m.workspace_id)
    AND m.host_id = auth.uid()
  )
);

CREATE POLICY "Attendees can view own record"
ON public.meeting_attendees
FOR SELECT
USING (
  meeting_attendees.user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND is_workspace_member(auth.uid(), m.workspace_id)
  )
);

-- Allow attendees to update their own status (accepted/declined)
CREATE POLICY "Attendees can update own status"
ON public.meeting_attendees
FOR UPDATE
USING (
  meeting_attendees.user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND is_workspace_member(auth.uid(), m.workspace_id)
  )
);