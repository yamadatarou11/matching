-- Allow users to resubmit their own verification after rejection.
-- Operations may reset only client-controlled fields; status remains pending.

create policy verifications_update on public.verifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = 'pending');
