
-- This function should be executed in the Supabase SQL editor
-- It creates a function that will delete a user from the auth.users table
-- with the service_role permissions

CREATE OR REPLACE FUNCTION public.delete_auth_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the permissions of the creator
SET search_path = public
AS $$
BEGIN
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_auth_user(UUID) TO authenticated;
