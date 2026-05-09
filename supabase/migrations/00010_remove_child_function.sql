-- ==============================================
-- Allow parents to remove a child from their family
-- Run this in Supabase SQL Editor
-- ==============================================
CREATE OR REPLACE FUNCTION public.remove_child_from_family(child_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE caller_role text;
caller_family_id uuid;
child_family_id uuid;
BEGIN -- Get caller info
SELECT role,
  family_id INTO caller_role,
  caller_family_id
FROM public.profiles
WHERE id = auth.uid();
-- Must be a parent
IF caller_role != 'parent' THEN RAISE EXCEPTION 'Only parents can remove children';
END IF;
-- Get child's family
SELECT family_id INTO child_family_id
FROM public.profiles
WHERE id = child_id;
-- Child must be in the same family
IF child_family_id IS NULL
OR child_family_id != caller_family_id THEN RAISE EXCEPTION 'Child is not in your family';
END IF;
-- Remove child from family
UPDATE public.profiles
SET family_id = NULL
WHERE id = child_id;
END;
$$;