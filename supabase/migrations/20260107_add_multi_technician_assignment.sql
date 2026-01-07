-- ========================================
-- MULTI-TECHNICIAN ASSIGNMENT FEATURE
-- Migration: ticket_assignees junction table
-- Date: 2026-01-07
-- ========================================

-- Create ticket_assignees junction table
CREATE TABLE IF NOT EXISTS public.ticket_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT false,
    work_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(ticket_id, user_id) -- Prevent duplicate assignments
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_assignees_ticket ON public.ticket_assignees(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignees_user ON public.ticket_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignees_primary ON public.ticket_assignees(ticket_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_ticket_assignees_completed ON public.ticket_assignees(completed_at);

-- Comments for documentation
COMMENT ON TABLE public.ticket_assignees IS 'Many-to-many relationship for multiple technicians per ticket';
COMMENT ON COLUMN public.ticket_assignees.ticket_id IS 'Reference to tickets table';
COMMENT ON COLUMN public.ticket_assignees.user_id IS 'Reference to users table (must be role=technician)';
COMMENT ON COLUMN public.ticket_assignees.is_primary IS 'Primary assignee - syncs with tickets.assigned_to field';
COMMENT ON COLUMN public.ticket_assignees.assigned_by IS 'User who assigned this technician (admin/manager)';
COMMENT ON COLUMN public.ticket_assignees.completed_at IS 'When technician marked their work as complete';
COMMENT ON COLUMN public.ticket_assignees.work_notes IS 'Notes from technician about their work';

-- Enable Row Level Security
ALTER TABLE public.ticket_assignees ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view
DROP POLICY IF EXISTS "Ticket assignees viewable by authenticated users" ON public.ticket_assignees;
CREATE POLICY "Ticket assignees viewable by authenticated users"
    ON public.ticket_assignees FOR SELECT
    USING (auth.role() = 'authenticated');

-- RLS Policy: Admin/Manager can manage all
DROP POLICY IF EXISTS "Ticket assignees manageable by admin/manager" ON public.ticket_assignees;
CREATE POLICY "Ticket assignees manageable by admin/manager"
    ON public.ticket_assignees FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- RLS Policy: Technicians can update their own assignments
DROP POLICY IF EXISTS "Technicians can update their own assignments" ON public.ticket_assignees;
CREATE POLICY "Technicians can update their own assignments"
    ON public.ticket_assignees FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ========================================
-- BACKWARD COMPATIBILITY
-- Migrate existing single assignments
-- ========================================

-- Migrate existing tickets.assigned_to to ticket_assignees
INSERT INTO public.ticket_assignees (ticket_id, user_id, is_primary, assigned_at, assigned_by)
SELECT 
    t.id AS ticket_id,
    t.assigned_to AS user_id,
    true AS is_primary,
    t.updated_at AS assigned_at,
    t.created_by AS assigned_by
FROM public.tickets t
WHERE t.assigned_to IS NOT NULL
  AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = t.assigned_to
      AND u.role = 'technician'
  )
ON CONFLICT (ticket_id, user_id) DO NOTHING;

-- ========================================
-- TRIGGER: Sync primary assignee with tickets.assigned_to
-- ========================================

-- Function to sync primary assignee
CREATE OR REPLACE FUNCTION sync_primary_assignee()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        -- Update tickets.assigned_to when primary assignee changes
        UPDATE public.tickets
        SET assigned_to = NEW.user_id,
            updated_at = NOW()
        WHERE id = NEW.ticket_id;
        
        -- Unset other primary assignees for this ticket
        UPDATE public.ticket_assignees
        SET is_primary = false,
            updated_at = NOW()
        WHERE ticket_id = NEW.ticket_id
          AND id != NEW.id
          AND is_primary = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_sync_primary_assignee ON public.ticket_assignees;

-- Create trigger
CREATE TRIGGER trigger_sync_primary_assignee
    AFTER INSERT OR UPDATE OF is_primary ON public.ticket_assignees
    FOR EACH ROW
    WHEN (NEW.is_primary = true)
    EXECUTE FUNCTION sync_primary_assignee();

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if table created successfully
-- SELECT COUNT(*) FROM public.ticket_assignees;

-- Check migrated assignments
-- SELECT 
--     ta.ticket_id,
--     t.custom_id,
--     u.full_name as technician,
--     ta.is_primary,
--     ta.assigned_at
-- FROM public.ticket_assignees ta
-- JOIN public.tickets t ON t.id = ta.ticket_id
-- JOIN public.users u ON u.id = ta.user_id
-- ORDER BY ta.assigned_at DESC
-- LIMIT 10;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies 
-- WHERE tablename = 'ticket_assignees';
