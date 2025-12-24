-- Add custom_id field to tickets table and auto-generate it
-- Format: HPIO-{ticket_number}-{DDMMYY}

-- Add custom_id column
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS custom_id TEXT UNIQUE;

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START WITH 1;

-- Function to generate custom ticket ID
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TEXT AS $$
DECLARE
    ticket_num INTEGER;
    date_part TEXT;
    custom_id TEXT;
BEGIN
    -- Get next ticket number
    ticket_num := nextval('ticket_number_seq');
    
    -- Format date as DDMMYY
    date_part := to_char(CURRENT_DATE, 'DDMMYY');
    
    -- Generate custom ID: HPIO-{number}-{DDMMYY}
    custom_id := 'HPIO-' || ticket_num || '-' || date_part;
    
    RETURN custom_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-set custom_id on insert
CREATE OR REPLACE FUNCTION set_ticket_custom_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.custom_id IS NULL THEN
        NEW.custom_id := generate_ticket_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS auto_set_ticket_custom_id ON public.tickets;

-- Create trigger to auto-generate custom_id
CREATE TRIGGER auto_set_ticket_custom_id
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_custom_id();

-- Update existing tickets to have custom IDs (if any)
DO $$
DECLARE
    ticket_record RECORD;
BEGIN
    FOR ticket_record IN 
        SELECT id FROM public.tickets WHERE custom_id IS NULL ORDER BY created_at
    LOOP
        UPDATE public.tickets 
        SET custom_id = generate_ticket_id()
        WHERE id = ticket_record.id;
    END LOOP;
END $$;

-- Create index on custom_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_custom_id ON public.tickets(custom_id);

-- Comments
COMMENT ON COLUMN public.tickets.custom_id IS 'Auto-generated custom ticket ID in format HPIO-{number}-{DDMMYY}';
COMMENT ON FUNCTION generate_ticket_id() IS 'Generates unique ticket ID in format HPIO-{number}-{DDMMYY}';
COMMENT ON FUNCTION set_ticket_custom_id() IS 'Trigger function to auto-set custom_id on ticket creation';
