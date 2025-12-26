-- Check if SLA policies table exists and seed default data
-- Run this in Supabase SQL Editor if SLA Policies page is empty

-- First, verify the table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sla_policies') THEN
        RAISE NOTICE 'Table sla_policies does not exist. Please run migration 0007_sla_management.sql first';
    ELSE
        RAISE NOTICE 'Table sla_policies exists';
    END IF;
END $$;

-- Insert default SLA policies (will skip if already exists)
INSERT INTO public.sla_policies (name, priority, response_time_hours, resolution_time_hours, is_active)
VALUES
    ('Critical Priority SLA', 'critical', 1, 4, true),
    ('High Priority SLA', 'high', 4, 24, true),
    ('Medium Priority SLA', 'medium', 8, 48, true),
    ('Low Priority SLA', 'low', 24, 72, true)
ON CONFLICT (priority, is_active) WHERE is_active = true DO NOTHING;

-- Show the current SLA policies
SELECT 
    name as "Policy Name",
    priority as "Priority",
    response_time_hours as "Response Time (hours)",
    resolution_time_hours as "Resolution Time (hours)",
    is_active as "Active",
    created_at as "Created At"
FROM public.sla_policies
ORDER BY 
    CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;
