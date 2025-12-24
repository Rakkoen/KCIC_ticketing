-- SLA Policies Table
CREATE TABLE IF NOT EXISTS public.sla_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    response_time_hours INTEGER NOT NULL DEFAULT 24,
    resolution_time_hours INTEGER NOT NULL DEFAULT 72,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(priority, is_active)
);

-- Add SLA fields to tickets table
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_breach BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_due_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_policy_id UUID REFERENCES public.sla_policies(id);

-- Add SLA fields to incidents table
ALTER TABLE public.incidents
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_breach BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_due_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_policy_id UUID REFERENCES public.sla_policies(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON public.tickets(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_sla_breach ON public.tickets(sla_breach) WHERE sla_breach = true;
CREATE INDEX IF NOT EXISTS idx_incidents_due_date ON public.incidents(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_sla_breach ON public.incidents(sla_breach) WHERE sla_breach = true;

-- Function to calculate SLA due dates
CREATE OR REPLACE FUNCTION calculate_sla_dates(
    item_priority TEXT,
    created_timestamp TIMESTAMP WITH TIME ZONE,
    OUT response_due TIMESTAMP WITH TIME ZONE,
    OUT resolution_due TIMESTAMP WITH TIME ZONE,
    OUT policy_id UUID
) AS $$
DECLARE
    policy RECORD;
BEGIN
    -- Get active SLA policy for this priority
    SELECT * INTO policy
    FROM public.sla_policies
    WHERE priority = item_priority
    AND is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        -- Default fallback if no policy exists
        response_due := created_timestamp + INTERVAL '24 hours';
        resolution_due := created_timestamp + INTERVAL '72 hours';
        policy_id := NULL;
    ELSE
        response_due := created_timestamp + (policy.response_time_hours || ' hours')::INTERVAL;
        resolution_due := created_timestamp + (policy.resolution_time_hours || ' hours')::INTERVAL;
        policy_id := policy.id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-calculate SLA dates for tickets
CREATE OR REPLACE FUNCTION auto_calculate_ticket_sla()
RETURNS TRIGGER AS $$
DECLARE
    sla_dates RECORD;
BEGIN
    -- Calculate SLA dates
    SELECT * INTO sla_dates
    FROM calculate_sla_dates(NEW.priority, NEW.created_at);

    NEW.response_due_at := sla_dates.response_due;
    NEW.due_date := sla_dates.resolution_due;
    NEW.sla_policy_id := sla_dates.policy_id;
    NEW.sla_breach := false;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-calculate SLA dates for incidents
CREATE OR REPLACE FUNCTION auto_calculate_incident_sla()
RETURNS TRIGGER AS $$
DECLARE
    sla_dates RECORD;
    incident_priority TEXT;
BEGIN
    -- Map severity to priority for SLA lookup
    incident_priority := CASE NEW.severity
        WHEN 'critical' THEN 'critical'
        WHEN 'high' THEN 'high'
        WHEN 'medium' THEN 'medium'
        ELSE 'low'
    END;

    -- Calculate SLA dates
    SELECT * INTO sla_dates
    FROM calculate_sla_dates(incident_priority, NEW.detected_at);

    NEW.response_due_at := sla_dates.response_due;
    NEW.due_date := sla_dates.resolution_due;
    NEW.sla_policy_id := sla_dates.policy_id;
    NEW.sla_breach := false;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS ticket_sla_trigger ON public.tickets;
CREATE TRIGGER ticket_sla_trigger
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_ticket_sla();

DROP TRIGGER IF EXISTS incident_sla_trigger ON public.incidents;
CREATE TRIGGER incident_sla_trigger
    BEFORE INSERT ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_incident_sla();

-- Function to check and update SLA breaches
CREATE OR REPLACE FUNCTION check_sla_breaches()
RETURNS void AS $$
BEGIN
    -- Update tickets with SLA breaches
    UPDATE public.tickets
    SET sla_breach = true
    WHERE due_date < timezone('utc'::text, now())
    AND status NOT IN ('resolved', 'closed')
    AND sla_breach = false;

    -- Update incidents with SLA breaches
    UPDATE public.incidents
    SET sla_breach = true
    WHERE due_date < timezone('utc'::text, now())
    AND status NOT IN ('resolved', 'closed')
    AND sla_breach = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get SLA compliance stats
CREATE OR REPLACE FUNCTION get_sla_stats(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    total_tickets INTEGER,
    breached_tickets INTEGER,
    compliance_rate NUMERIC,
    avg_response_time INTERVAL,
    avg_resolution_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_tickets,
        COUNT(*) FILTER (WHERE t.sla_breach = true)::INTEGER as breached_tickets,
        ROUND(
            (COUNT(*) FILTER (WHERE t.sla_breach = false)::NUMERIC / 
            NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
            2
        ) as compliance_rate,
        AVG(t.first_response_at - t.created_at) as avg_response_time,
        AVG(t.updated_at - t.created_at) FILTER (WHERE t.status IN ('resolved', 'closed')) as avg_resolution_time
    FROM public.tickets t
    WHERE (start_date IS NULL OR t.created_at >= start_date)
    AND (end_date IS NULL OR t.created_at <= end_date);
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger for SLA policies
CREATE OR REPLACE FUNCTION update_sla_policy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sla_policies_updated_at
    BEFORE UPDATE ON public.sla_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_sla_policy_updated_at();

-- RLS Policies for sla_policies
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

-- Everyone can view SLA policies
CREATE POLICY "SLA policies are viewable by everyone" ON public.sla_policies
    FOR SELECT USING (true);

-- Only admins and managers can manage SLA policies
CREATE POLICY "Admins and managers can insert SLA policies" ON public.sla_policies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins and managers can update SLA policies" ON public.sla_policies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins can delete SLA policies" ON public.sla_policies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Insert default SLA policies
INSERT INTO public.sla_policies (name, priority, response_time_hours, resolution_time_hours, is_active)
VALUES
    ('Critical Priority SLA', 'critical', 1, 4, true),
    ('High Priority SLA', 'high', 4, 24, true),
    ('Medium Priority SLA', 'medium', 8, 48, true),
    ('Low Priority SLA', 'low', 24, 72, true)
ON CONFLICT (priority, is_active) WHERE is_active = true DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.sla_policies TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_sla_dates TO authenticated;
GRANT EXECUTE ON FUNCTION get_sla_stats TO authenticated;

-- Comments
COMMENT ON TABLE public.sla_policies IS 'Service Level Agreement policies defining response and resolution times';
COMMENT ON FUNCTION check_sla_breaches IS 'Checks and updates SLA breach status for tickets and incidents';
COMMENT ON FUNCTION get_sla_stats IS 'Returns SLA compliance statistics for a given time period';
