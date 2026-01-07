-- ========================================
-- KCIC TICKETING SYSTEM - DATABASE MIGRATIONS
-- Combined Migration Script for Manual Execution
-- Date: 2026-01-06
-- ========================================

-- IMPORTANT: Run this script in your Supabase SQL Editor
-- Dashboard URL: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

-- ========================================
-- MIGRATION 1: Rename Worker Role to Technician
-- ========================================

-- Update existing users with 'worker' role to 'technician'
UPDATE public.users 
SET role = 'technician', updated_at = NOW()
WHERE role = 'worker';

-- Update the role constraint to use new role name
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'manager', 'technician', 'employee'));

-- Verification: Check role distribution
-- SELECT role, COUNT(*) as count FROM public.users GROUP BY role;

-- ========================================
-- MIGRATION 2: Create Activity Logs Table
-- ========================================

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE public.activity_logs IS 'Audit trail for all user actions in the system';
COMMENT ON COLUMN public.activity_logs.action IS 'Action type: create, update, comment, upload, status_change, delete, assign';
COMMENT ON COLUMN public.activity_logs.target_type IS 'Target entity type: ticket, comment, attachment, user';
COMMENT ON COLUMN public.activity_logs.details IS 'JSON object containing action-specific data (changes, old/new values, etc)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_ticket_id ON public.activity_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migration)
DROP POLICY IF EXISTS "Activity logs are viewable by authenticated users" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Only admins can delete activity logs" ON public.activity_logs;

-- Create RLS policies
CREATE POLICY "Activity logs are viewable by authenticated users"
    ON public.activity_logs
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create activity logs"
    ON public.activity_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can delete activity logs"
    ON public.activity_logs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Verification: Check activity logs table
-- SELECT COUNT(*) as total_logs FROM public.activity_logs;

-- ========================================
-- MIGRATION 3: Add SLA Fields to Tickets
-- ========================================

-- Add SLA timestamp fields
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Add SLA status fields with enums
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS sla_response_status VARCHAR(20) CHECK (sla_response_status IN ('on_time', 'breached', 'pending')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS sla_solving_status VARCHAR(20) CHECK (sla_solving_status IN ('on_time', 'breached', 'pending')) DEFAULT 'pending';

-- Add comments for documentation
COMMENT ON COLUMN public.tickets.first_response_at IS 'Timestamp when ticket received first response from technician/manager';
COMMENT ON COLUMN public.tickets.resolved_at IS 'Timestamp when ticket status changed to resolved or closed';
COMMENT ON COLUMN public.tickets.sla_response_status IS 'SLA status for response time: on_time, breached, or pending';
COMMENT ON COLUMN public.tickets.sla_solving_status IS 'SLA status for solving time: on_time, breached, or pending';

-- Create helper function to auto-update resolved_at
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

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_resolved_timestamp ON public.tickets;
CREATE TRIGGER trigger_update_resolved_timestamp
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_resolved_timestamp();

-- Create indexes for SLA queries
CREATE INDEX IF NOT EXISTS idx_tickets_first_response_at ON public.tickets(first_response_at);
CREATE INDEX IF NOT EXISTS idx_tickets_resolved_at ON public.tickets(resolved_at);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_response_status ON public.tickets(sla_response_status);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_solving_status ON public.tickets(sla_solving_status);

-- Verification: Check tickets with SLA fields
-- SELECT id, status, first_response_at, resolved_at, sla_response_status, sla_solving_status FROM public.tickets LIMIT 10;
-- SELECT sla_response_status, COUNT(*) FROM public.tickets GROUP BY sla_response_status;
-- SELECT sla_solving_status, COUNT(*) FROM public.tickets GROUP BY sla_solving_status;

-- ========================================
-- MIGRATION COMPLETE!
-- ========================================

-- Final verification queries:
-- 1. Check all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Check activity_logs structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activity_logs';

-- 3. Check tickets structure  
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tickets' ORDER BY ordinal_position;

-- 4. Check RLS policies
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('activity_logs', 'tickets');

-- ========================================
-- MIGRATION COMPLETE!
-- ========================================
-- All migrations completed successfully!
-- You can now use the new features in your application.
