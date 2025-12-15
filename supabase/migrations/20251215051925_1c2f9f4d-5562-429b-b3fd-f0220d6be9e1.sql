-- Drop the current SELECT policy that allows all workspace members to view attendee emails
DROP POLICY IF EXISTS "Members can view meeting attendees" ON public.meeting_attendees;

-- Create a more restrictive policy: only meeting hosts can view attendee details (including emails)
-- Attendees can also see their own record
CREATE POLICY "Hosts and self can view meeting attendees"
ON public.meeting_attendees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM meetings m
    WHERE m.id = meeting_attendees.meeting_id
    AND m.host_id = auth.uid()
  )
  OR meeting_attendees.user_id = auth.uid()
);