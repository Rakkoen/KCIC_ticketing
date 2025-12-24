-- Fix the RLS policy for tickets table to allow authenticated users to create tickets
-- The issue is that the policy was checking auth.uid() = created_by but created_by is nullable
-- This policy needs to be updated to properly check the created_by field

-- Drop the existing policy
drop policy if exists "Authenticated users can create tickets" on public.tickets;

-- Create a new policy that properly checks the created_by field
create policy "Authenticated users can create tickets"
  on public.tickets for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Also ensure users can view all tickets
drop policy if exists "Tickets are viewable by authenticated users" on public.tickets;

create policy "Tickets are viewable by authenticated users"
  on public.tickets for select
  to authenticated
  using (true);

-- Ensure users can update their own tickets
drop policy if exists "Users can update their own tickets" on public.tickets;

create policy "Users can update their own tickets"
  on public.tickets for update
  to authenticated
  using (auth.uid() = created_by or auth.uid() = assigned_to);