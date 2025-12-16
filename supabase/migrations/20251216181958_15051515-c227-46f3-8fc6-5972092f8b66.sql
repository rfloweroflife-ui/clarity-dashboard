-- Fix: Drop SECURITY DEFINER view and recreate with SECURITY INVOKER (default)
-- This ensures the view respects RLS policies of the querying user

DROP VIEW IF EXISTS public.meeting_attendees_safe;

-- Recreate view with SECURITY INVOKER (default - respects caller's RLS)
CREATE VIEW public.meeting_attendees_safe 
WITH (security_invoker = true)
AS
SELECT 
  ma.id,
  ma.meeting_id,
  ma.user_id,
  ma.status,
  -- Only show email to meeting host or the attendee themselves
  CASE 
    WHEN m.host_id = auth.uid() THEN ma.email
    WHEN ma.user_id = auth.uid() THEN ma.email
    ELSE NULL
  END as email,
  ma.guest_token_expires_at
FROM public.meeting_attendees ma
JOIN public.meetings m ON m.id = ma.meeting_id;

-- Grant access to authenticated users (RLS on underlying tables will apply)
GRANT SELECT ON public.meeting_attendees_safe TO authenticated;

COMMENT ON VIEW public.meeting_attendees_safe IS 'Secure view with SECURITY INVOKER - masks attendee emails unless viewer is meeting host or the attendee. RLS on meeting_attendees table is respected.';