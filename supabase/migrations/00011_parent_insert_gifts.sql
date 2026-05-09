-- Helper functions in public schema (auth schema is restricted)
CREATE OR REPLACE FUNCTION public.user_family_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT family_id
FROM public.profiles
WHERE id = auth.uid() $$;
CREATE OR REPLACE FUNCTION public.user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT role::text
FROM public.profiles
WHERE id = auth.uid() $$;
-- Allow parents to insert gifts for children in their family
CREATE POLICY "Parents can insert gifts" ON gifts FOR
INSERT WITH CHECK (
        public.user_role() = 'parent'
        AND family_id = public.user_family_id()
    );