-- Remove email column from profiles table since it duplicates auth.users data
-- Email should be accessed via auth.user.email from the auth context

ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Also add the missing DELETE policy for GDPR compliance
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Update the handle_new_user function to not insert email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create profile (without email - use auth.users for that)
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default workspace
  INSERT INTO public.workspaces (name, owner_id)
  VALUES ('My Workspace', NEW.id)
  RETURNING id INTO new_workspace_id;
  
  -- Add user as workspace member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$function$;