-- Allow children to update their own submissions (e.g. marking a claimed mission as completed/pending)
CREATE POLICY "Children can update own submissions" ON mission_submissions FOR
UPDATE USING (
    auth.uid() = child_id
    AND family_id IN (
      SELECT family_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );