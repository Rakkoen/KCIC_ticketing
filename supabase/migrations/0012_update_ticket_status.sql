-- Update ticket status values
-- Old: new, in_progress, resolved, closed
-- New: open, in_progress, on_escalation, resolved, closed

-- First, update existing 'new' status to 'open'
UPDATE public.tickets 
SET status = 'open' 
WHERE status = 'new';

-- Drop the old constraint
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_status_check;

-- Add new constraint with updated values
ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('open', 'in_progress', 'on_escalation', 'resolved', 'closed'));

-- Update default value
ALTER TABLE public.tickets 
ALTER COLUMN status SET DEFAULT 'open';

-- Do the same for incidents table
UPDATE public.incidents 
SET status = 'open' 
WHERE status = 'new';

ALTER TABLE public.incidents 
DROP CONSTRAINT IF EXISTS incidents_status_check;

ALTER TABLE public.incidents 
ADD CONSTRAINT incidents_status_check 
CHECK (status IN ('open', 'in_progress', 'on_escalation', 'resolved', 'closed'));

ALTER TABLE public.incidents 
ALTER COLUMN status SET DEFAULT 'open';

-- Comments
COMMENT ON COLUMN public.tickets.status IS 'Ticket workflow status: open, in_progress, on_escalation, resolved, closed';
COMMENT ON COLUMN public.incidents.status IS 'Incident workflow status: open, in_progress, on_escalation, resolved, closed';
