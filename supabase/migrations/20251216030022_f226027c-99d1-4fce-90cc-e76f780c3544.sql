-- ============================================
-- TASK 1: HARDEN SECURITY DEFINER FUNCTIONS (using CREATE OR REPLACE)
-- ============================================

-- Recreate has_role with auth.uid() binding (no user_id param)
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

-- Revoke public access, grant only to authenticated
REVOKE ALL ON FUNCTION public.has_role(app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;

-- Recreate is_workspace_member with auth.uid() binding
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

-- Revoke public access, grant only to authenticated
REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;

-- ============================================
-- TASK 2 & 3: GUEST TOKEN SYSTEM FOR MEETING ATTENDEES
-- ============================================

-- Add guest token columns
ALTER TABLE public.meeting_attendees 
ADD COLUMN IF NOT EXISTS guest_token_hash text,
ADD COLUMN IF NOT EXISTS guest_token_expires_at timestamptz;

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_guest_token 
ON public.meeting_attendees(guest_token_hash) 
WHERE guest_token_hash IS NOT NULL;

-- Function to generate secure guest token (only host can call)
CREATE OR REPLACE FUNCTION public.generate_guest_token(p_attendee_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
  v_hash text;
  v_meeting_id uuid;
BEGIN
  -- Verify caller is the meeting host
  SELECT ma.meeting_id INTO v_meeting_id
  FROM public.meeting_attendees ma
  JOIN public.meetings m ON m.id = ma.meeting_id
  WHERE ma.id = p_attendee_id AND m.host_id = auth.uid();
  
  IF v_meeting_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: only meeting host can generate guest tokens';
  END IF;
  
  -- Generate secure random token
  v_token := encode(gen_random_bytes(32), 'hex');
  v_hash := encode(sha256(v_token::bytea), 'hex');
  
  -- Store hash and expiry (7 days)
  UPDATE public.meeting_attendees
  SET guest_token_hash = v_hash,
      guest_token_expires_at = now() + interval '7 days'
  WHERE id = p_attendee_id;
  
  RETURN v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_guest_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_guest_token(uuid) TO authenticated;

-- Function to verify guest token (for anon access)
CREATE OR REPLACE FUNCTION public.verify_guest_token(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
  v_attendee_id uuid;
BEGIN
  v_hash := encode(sha256(p_token::bytea), 'hex');
  
  SELECT id INTO v_attendee_id
  FROM public.meeting_attendees
  WHERE guest_token_hash = v_hash
    AND guest_token_expires_at > now();
  
  RETURN v_attendee_id;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_guest_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_guest_token(text) TO anon, authenticated;

-- Function for guests to update RSVP status
CREATE OR REPLACE FUNCTION public.guest_update_rsvp(p_token text, p_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attendee_id uuid;
BEGIN
  IF p_status NOT IN ('pending', 'accepted', 'declined', 'tentative') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  
  v_attendee_id := public.verify_guest_token(p_token);
  
  IF v_attendee_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;
  
  UPDATE public.meeting_attendees
  SET status = p_status
  WHERE id = v_attendee_id;
  
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.guest_update_rsvp(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guest_update_rsvp(text, text) TO anon, authenticated;

-- Function for guests to view their meeting details
CREATE OR REPLACE FUNCTION public.guest_get_meeting(p_token text)
RETURNS TABLE (
  meeting_id uuid,
  meeting_title text,
  meeting_status text,
  meeting_link text,
  attendee_id uuid,
  attendee_status text,
  attendee_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attendee_id uuid;
BEGIN
  v_attendee_id := public.verify_guest_token(p_token);
  
  IF v_attendee_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;
  
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.status,
    m.meeting_link,
    ma.id,
    ma.status,
    ma.email
  FROM public.meeting_attendees ma
  JOIN public.meetings m ON m.id = ma.meeting_id
  WHERE ma.id = v_attendee_id;
END;
$$;

REVOKE ALL ON FUNCTION public.guest_get_meeting(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guest_get_meeting(text) TO anon, authenticated;

-- ============================================
-- TASK 2: UPDATE MEETING_ATTENDEES RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Attendees can update own status" ON public.meeting_attendees;
DROP POLICY IF EXISTS "Attendees can view own record" ON public.meeting_attendees;
DROP POLICY IF EXISTS "Hosts can view all attendees" ON public.meeting_attendees;
DROP POLICY IF EXISTS "Meeting hosts can manage attendees" ON public.meeting_attendees;

-- Policy: Meeting hosts can manage all attendees (full CRUD)
CREATE POLICY "Meeting hosts can manage attendees"
ON public.meeting_attendees
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.meetings m
    WHERE m.id = meeting_attendees.meeting_id 
    AND m.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meetings m
    WHERE m.id = meeting_attendees.meeting_id 
    AND m.host_id = auth.uid()
  )
);

-- Policy: Authenticated attendees can view their own record
CREATE POLICY "Authenticated attendees view own record"
ON public.meeting_attendees
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Authenticated attendees can update their status
CREATE POLICY "Authenticated attendees update own status"
ON public.meeting_attendees
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create secure view masking emails for non-hosts
CREATE OR REPLACE VIEW public.meeting_attendees_safe AS
SELECT 
  ma.id,
  ma.meeting_id,
  ma.user_id,
  ma.status,
  CASE 
    WHEN m.host_id = auth.uid() THEN ma.email
    WHEN ma.user_id = auth.uid() THEN ma.email
    ELSE NULL
  END as email,
  ma.guest_token_expires_at
FROM public.meeting_attendees ma
JOIN public.meetings m ON m.id = ma.meeting_id
WHERE is_workspace_member(m.workspace_id);

GRANT SELECT ON public.meeting_attendees_safe TO authenticated;

-- Add documentation comments
COMMENT ON VIEW public.meeting_attendees_safe IS 'Masks attendee emails unless viewer is meeting host or the attendee';
COMMENT ON FUNCTION public.generate_guest_token(uuid) IS 'Generates secure guest token. Only meeting host can call.';
COMMENT ON FUNCTION public.verify_guest_token(text) IS 'Verifies guest token, returns attendee ID if valid.';
COMMENT ON FUNCTION public.guest_update_rsvp(text, text) IS 'Allows guests to update RSVP via token.';
COMMENT ON FUNCTION public.guest_get_meeting(text) IS 'Returns meeting details for guest via token.';