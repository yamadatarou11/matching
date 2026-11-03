-- ================================================================
-- Allow users to resubmit verification rows
-- ================================================================
-- 0004 adds an UPDATE policy for the upsert resubmit path, but the
-- authenticated role also needs table privileges before RLS policies
-- are evaluated.

grant update on public.verifications to authenticated;
