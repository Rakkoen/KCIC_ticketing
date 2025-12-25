-- This script updates the ticket status constraint to include 'on_escalation'
-- and creates the new tables for comments and attachments
-- UPDATED: Includes DROP statements to handle "already exists" errors

-- ========================================
-- STEP 1: Update Ticket Status Constraint
-- ========================================

-- First, update existing 'new' status to 'open'
UPDATE public.tickets 
SET status = 'open' 
WHERE status = 'new';

-- Drop the old constraint if it exists
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_status_check;

-- Add new constraint with updated values INCLUDING 'on_escalation'
ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('open', 'in_progress', 'on_escalation', 'resolved', 'closed'));

-- Update default value
ALTER TABLE public.tickets 
ALTER COLUMN status SET DEFAULT 'open';

-- ========================================
-- STEP 2: Create Comments Table
-- ========================================

CREATE TABLE IF NOT EXISTS public.ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for ticket_comments
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_comments
-- Drop existing policies first to avoid "already exists" errors
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.ticket_comments;
CREATE POLICY "Authenticated users can view comments"
    ON public.ticket_comments FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.ticket_comments;
CREATE POLICY "Authenticated users can create comments"
    ON public.ticket_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- STEP 3: Create Attachments Table
-- ========================================

CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for ticket_attachments
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_attachments
DROP POLICY IF EXISTS "Authenticated users can view attachments" ON public.ticket_attachments;
CREATE POLICY "Authenticated users can view attachments"
    ON public.ticket_attachments FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can upload attachments" ON public.ticket_attachments;
CREATE POLICY "Users can upload attachments"
    ON public.ticket_attachments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

-- ========================================
-- VERIFICATION
-- ========================================

SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.tickets'::regclass 
AND conname = 'tickets_status_check';
