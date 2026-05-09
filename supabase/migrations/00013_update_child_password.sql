-- Allow a parent to update their child's password
-- Uses the supabase_auth_admin role to update auth.users
CREATE OR REPLACE FUNCTION public.update_child_password(child_id uuid, new_password text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE caller_role text;
caller_family uuid;
child_family uuid;
BEGIN -- Verify caller is a parent
SELECT role,
  family_id INTO caller_role,
  caller_family
FROM public.profiles
WHERE id = auth.uid();
IF caller_role != 'parent' THEN RAISE EXCEPTION 'Only parents can change child passwords';
END IF;
-- Verify child is in the same family
SELECT family_id INTO child_family
FROM public.profiles
WHERE id = child_id
  AND role = 'child';
IF child_family IS NULL
OR child_family != caller_family THEN RAISE EXCEPTION 'Child not found in your family';
END IF;
-- Update the password in auth.users
UPDATE auth.users
SET encrypted_password = crypt(new_password, gen_salt('bf'))
WHERE id = child_id;
END;
$$;