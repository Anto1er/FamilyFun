-- Function to look up a child's email by display name + family invite code (bypasses RLS for login)
DROP FUNCTION IF EXISTS public.get_child_email(text);
DROP FUNCTION IF EXISTS public.get_child_email(text, text);

CREATE OR REPLACE FUNCTION public.get_child_email(child_name text, family_invite_code text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT p.email FROM public.profiles p
  JOIN public.families f ON f.id = p.family_id
  WHERE TRIM(p.display_name) = TRIM(child_name)
    AND p.role = 'child'
    AND f.invite_code = family_invite_code
  LIMIT 1
$$;
