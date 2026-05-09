-- ==============================================
-- FIX: RLS infinite recursion on profiles table
-- Run this in Supabase SQL Editor
-- ==============================================
-- 1. Create a helper function that bypasses RLS to get user's family_id
CREATE OR REPLACE FUNCTION auth.user_family_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT family_id
FROM public.profiles
WHERE id = auth.uid() $$;
-- 2. Create a helper to get user's role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT role::text
FROM public.profiles
WHERE id = auth.uid() $$;
-- 3. Drop the problematic policies
DROP POLICY IF EXISTS "Users can view family members" ON profiles;
DROP POLICY IF EXISTS "Family members can view their family" ON families;
DROP POLICY IF EXISTS "Family members can view missions" ON missions;
DROP POLICY IF EXISTS "Parents can create missions" ON missions;
DROP POLICY IF EXISTS "Parents can update missions" ON missions;
DROP POLICY IF EXISTS "Family members can view gifts" ON gifts;
DROP POLICY IF EXISTS "Children can insert gifts" ON gifts;
DROP POLICY IF EXISTS "Parents can update gifts" ON gifts;
DROP POLICY IF EXISTS "Children can update own gifts for redemption" ON gifts;
DROP POLICY IF EXISTS "Family members can view submissions" ON mission_submissions;
DROP POLICY IF EXISTS "Children can submit missions" ON mission_submissions;
DROP POLICY IF EXISTS "Parents can validate submissions" ON mission_submissions;
DROP POLICY IF EXISTS "Family members can view transactions" ON transactions;
-- 4. Recreate policies using the helper functions (no recursion)
-- PROFILES
CREATE POLICY "Users can view family members" ON profiles FOR
SELECT USING (family_id = auth.user_family_id());
-- FAMILIES
CREATE POLICY "Family members can view their family" ON families FOR
SELECT USING (id = auth.user_family_id());
-- MISSIONS
CREATE POLICY "Family members can view missions" ON missions FOR
SELECT USING (family_id = auth.user_family_id());
CREATE POLICY "Parents can create missions" ON missions FOR
INSERT WITH CHECK (
    auth.user_role() = 'parent'
    AND family_id = auth.user_family_id()
  );
CREATE POLICY "Parents can update missions" ON missions FOR
UPDATE USING (
    auth.user_role() = 'parent'
    AND family_id = auth.user_family_id()
  );
-- GIFTS
CREATE POLICY "Family members can view gifts" ON gifts FOR
SELECT USING (family_id = auth.user_family_id());
CREATE POLICY "Children can insert gifts" ON gifts FOR
INSERT WITH CHECK (
    auth.uid() = child_id
    AND family_id = auth.user_family_id()
  );
CREATE POLICY "Parents can update gifts" ON gifts FOR
UPDATE USING (
    auth.user_role() = 'parent'
    AND family_id = auth.user_family_id()
  );
CREATE POLICY "Children can update own gifts for redemption" ON gifts FOR
UPDATE USING (
    auth.uid() = child_id
    AND family_id = auth.user_family_id()
  );
-- MISSION SUBMISSIONS
CREATE POLICY "Family members can view submissions" ON mission_submissions FOR
SELECT USING (family_id = auth.user_family_id());
CREATE POLICY "Children can submit missions" ON mission_submissions FOR
INSERT WITH CHECK (
    auth.uid() = child_id
    AND family_id = auth.user_family_id()
  );
CREATE POLICY "Parents can validate submissions" ON mission_submissions FOR
UPDATE USING (
    auth.user_role() = 'parent'
    AND family_id = auth.user_family_id()
  );
-- TRANSACTIONS
CREATE POLICY "Family members can view transactions" ON transactions FOR
SELECT USING (family_id = auth.user_family_id());