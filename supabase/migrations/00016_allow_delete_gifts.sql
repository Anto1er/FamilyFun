-- Allow children to delete their own gifts
CREATE POLICY "Children can delete own gifts" ON gifts FOR DELETE USING (
  auth.uid() = child_id
  AND family_id = public.user_family_id()
);
-- Allow parents to delete any gift in their family
CREATE POLICY "Parents can delete family gifts" ON gifts FOR DELETE USING (
  public.user_role() = 'parent'
  AND family_id = public.user_family_id()
);