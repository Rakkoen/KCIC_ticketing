-- Migration: Add SLA Fields to Tickets Table
-- Priority 2: Database Schema Update
-- Date: 2026-01-06

-- Step 1: Add SLA timestamp fields
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Add SLA status fields with enums
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS sla_response_status VARCHAR(20) CHECK (sla_response_status IN ('on_time', 'breached', 'pending')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS sla_solving_status VARCHAR(20) CHECK (sla_solving_status IN ('on_time', 'breached', 'pending')) DEFAULT 'pending';

-- Step 3: Add comments for documentation
COMMENT ON COLUMN public.tickets.first_response_at IS 'Timestamp when ticket received first response from technician/manager';
COMMENT ON COLUMN public.tickets.resolved_at IS 'Timestamp when ticket status changed to resolved or closed';
COMMENT ON COLUMN public.tickets.sla_response_status IS 'SLA status for response time: on_time, breached, or pending';
COMMENT ON COLUMN public.tickets.sla_solving_status IS 'SLA status for solving time: on_time, breached, or pending';

-- Step 4: Create helper function to auto-update first_response_at
CREATE OR REPLACE FUNCTION update_first_response_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if first_response_at is NULL and a comment is being added
    -- This assumes comments table has ticket_id and user who is not the ticket creator
    IF NEW.first_response_at IS NULL THEN
        -- Check if there's a comment from a technician or manager
        IF EXISTS (
            SELECT 1 FROM ticket_comments tc
            JOIN users u ON tc.user_id = u.id
            WHERE tc.ticket_id = NEW.id
            AND u.role IN ('technician', 'manager', 'admin')
            AND u.id != NEW.created_by
            LIMIT 1
        ) THEN
            NEW.first_response_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create helper function to auto-update resolved_at
CREATE OR REPLACE FUNCTION update_resolved_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update resolved_at when status changes to 'resolved' or 'closed'
    IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
        NEW.resolved_at = NOW();
    END IF;
    
    -- Clear resolved_at if ticket is reopened
    IF NEW.status NOT IN ('resolved', 'closed') AND OLD.status IN ('resolved', 'closed') THEN
        NEW.resolved_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create triggers
DROP TRIGGER IF EXISTS trigger_update_resolved_timestamp ON public.tickets;
CREATE TRIGGER trigger_update_resolved_timestamp
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_resolved_timestamp();

-- Step 7: Create indexes for SLA queries
CREATE INDEX IF NOT EXISTS idx_tickets_first_response_at ON public.tickets(first_response_at);
CREATE INDEX IF NOT EXISTS idx_tickets_resolved_at ON public.tickets(resolved_at);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_response_status ON public.tickets(sla_response_status);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_solving_status ON public.tickets(sla_solving_status);

-- Verification queries
-- SELECT id, status, first_response_at, resolved_at, sla_response_status, sla_solving_status FROM public.tickets LIMIT 10;
-- SELECT sla_response_status, COUNT(*) FROM public.tickets GROUP BY sla_response_status;
-- SELECT sla_solving_status, COUNT(*) FROM public.tickets GROUP BY sla_solving_status;
