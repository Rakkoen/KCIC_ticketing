-- Migration: Create Activity Logs Table for Audit Trail
-- Priority 2: Database Schema Update
-- Date: 2026-01-06

-- Step 1: Create activity_logs table
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

-- Step 2: Add comments for documentation
COMMENT ON TABLE public.activity_logs IS 'Audit trail for all user actions in the system';
COMMENT ON COLUMN public.activity_logs.action IS 'Action type: create, update, comment, upload, status_change, delete, assign';
COMMENT ON COLUMN public.activity_logs.target_type IS 'Target entity type: ticket, comment, attachment, user';
COMMENT ON COLUMN public.activity_logs.details IS 'JSON object containing action-specific data (changes, old/new values, etc)';

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_ticket_id ON public.activity_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- Step 4: Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies

-- Allow all authenticated users to view activity logs
CREATE POLICY "Activity logs are viewable by authenticated users"
    ON public.activity_logs
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own activity logs
CREATE POLICY "Users can create activity logs"
    ON public.activity_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Only admins can delete activity logs (for cleanup purposes)
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

-- Verification query
-- SELECT COUNT(*) as total_logs FROM public.activity_logs;
-- SELECT action, COUNT(*) as count FROM public.activity_logs GROUP BY action;
