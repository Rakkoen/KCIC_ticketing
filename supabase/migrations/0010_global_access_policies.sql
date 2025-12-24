-- Add DELETE policy for tickets table to allow global deletion
-- This allows all authenticated users to delete any ticket

-- Drop existing restrictive update policy if needed
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;

-- Create new global update policy
CREATE POLICY "Authenticated users can update all tickets"
    ON public.tickets FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add DELETE policy for global access
CREATE POLICY "Authenticated users can delete all tickets"
    ON public.tickets FOR DELETE
    TO authenticated
    USING (true);

-- Same for incidents table
DROP POLICY IF EXISTS "Users can update their own incidents" ON public.incidents;

CREATE POLICY "Authenticated users can update all incidents"
    ON public.incidents FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all incidents"
    ON public.incidents FOR DELETE
    TO authenticated
    USING (true);

-- Comments
COMMENT ON POLICY "Authenticated users can update all tickets" ON public.tickets 
    IS 'Allows all authenticated users to update any ticket (global access)';
COMMENT ON POLICY "Authenticated users can delete all tickets" ON public.tickets 
    IS 'Allows all authenticated users to delete any ticket (global access)';
