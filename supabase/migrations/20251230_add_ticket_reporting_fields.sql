-- Migration: Add reporting fields to tickets table
-- Date: 2025-12-30
-- Description: Add location, equipment_category, wr_document_number, escalation_status, and comments fields

-- Add location column for specific location details (e.g., "Platform 2")
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add equipment_category column for asset type (free text input)
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS equipment_category TEXT;

-- Add wr_document_number column for Work Request document reference
-- Auto-generated or set when WR document is uploaded during escalation
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS wr_document_number TEXT UNIQUE;

-- Add escalation_status column for manual escalation tracking
-- Values: yes, no, pending
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS escalation_status TEXT DEFAULT 'no'
CHECK (escalation_status IN ('yes', 'no', 'pending'));

-- Add comments column for troubleshooting notes
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS comments TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_equipment_category ON public.tickets(equipment_category);
CREATE INDEX IF NOT EXISTS idx_tickets_escalation_status ON public.tickets(escalation_status);
CREATE INDEX IF NOT EXISTS idx_tickets_wr_document_number ON public.tickets(wr_document_number);

-- Add column comments for documentation
COMMENT ON COLUMN public.tickets.location IS 'Specific physical location details (e.g., Platform 2, Gate 1)';
COMMENT ON COLUMN public.tickets.equipment_category IS 'Type of equipment/asset (free text): e.g., Electrical, Mechanical, IT, Civil, Plumbing, HVAC, Safety';
COMMENT ON COLUMN public.tickets.wr_document_number IS 'Work Request document number, auto-generated or set during escalation';
COMMENT ON COLUMN public.tickets.escalation_status IS 'Manual escalation status: yes, no, pending';
COMMENT ON COLUMN public.tickets.comments IS 'Troubleshooting notes and action details';

-- Function to auto-generate WR document number
-- Format: WR-{ticket_number}-{DDMMYY}
CREATE OR REPLACE FUNCTION generate_wr_document_number(ticket_custom_id TEXT)
RETURNS TEXT AS $$
DECLARE
    wr_number TEXT;
    date_part TEXT;
BEGIN
    -- Format date as DDMMYY
    date_part := to_char(CURRENT_DATE, 'DDMMYY');
    
    -- Generate WR number: WR-{ticket_custom_id}-{DDMMYY}
    wr_number := 'WR-' || ticket_custom_id || '-' || date_part;
    
    RETURN wr_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-set WR document number when status changes to 'on_escalation'
CREATE OR REPLACE FUNCTION auto_set_wr_document_number()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to 'on_escalation' and wr_document_number is not set
    IF NEW.status = 'on_escalation' AND NEW.wr_document_number IS NULL THEN
        NEW.wr_document_number := generate_wr_document_number(NEW.custom_id);
        NEW.escalation_status := 'yes';
    END IF;
    
    -- If status is no longer 'on_escalation', update escalation_status
    IF OLD.status = 'on_escalation' AND NEW.status != 'on_escalation' THEN
        -- Keep escalation_status as 'yes' if it was escalated before
        -- Don't automatically change it back
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to prevent duplicates
DROP TRIGGER IF EXISTS auto_set_wr_document_trigger ON public.tickets;

-- Create trigger to auto-set WR document number on escalation
CREATE TRIGGER auto_set_wr_document_trigger
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_wr_document_number();

-- Update existing tickets to have default values
UPDATE public.tickets
SET 
    escalation_status = CASE 
        WHEN status = 'on_escalation' THEN 'yes'
        ELSE 'no'
    END
WHERE escalation_status IS NULL;

COMMENT ON FUNCTION generate_wr_document_number(TEXT) IS 'Generates WR document number in format WR-{ticket_custom_id}-{DDMMYY}';
COMMENT ON FUNCTION auto_set_wr_document_number() IS 'Trigger function to auto-set WR document number when status changes to on_escalation';
