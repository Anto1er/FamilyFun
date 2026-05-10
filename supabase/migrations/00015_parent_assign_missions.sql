-- Allow parents to insert mission_submissions (for assigning missions to children)
CREATE POLICY "Parents can assign missions" ON mission_submissions FOR
INSERT WITH CHECK (
    (SELECT role::text FROM public.profiles WHERE id = auth.uid()) = 'parent'
    AND family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
