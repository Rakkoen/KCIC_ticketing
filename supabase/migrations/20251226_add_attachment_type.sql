-- Migration: Add attachment_type field to ticket_attachments
-- This allows us to distinguish between work evidence photos and vendor request documents

-- Step 1: Add the attachment_type column with a default value
ALTER TABLE public.ticket_attachments
ADD COLUMN IF NOT EXISTS attachment_type TEXT NOT NULL DEFAULT 'vendor_request';

-- Step 2: Add a check constraint to ensure only valid types
ALTER TABLE public.ticket_attachments
DROP CONSTRAINT IF EXISTS ticket_attachments_type_check;

ALTER TABLE public.ticket_attachments
ADD CONSTRAINT ticket_attachments_type_check 
CHECK (attachment_type IN ('work_evidence', 'vendor_request'));

-- Step 3: Create an index for faster filtering by type
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_type 
ON public.ticket_attachments(attachment_type);

-- Step 4: Create an index for combined ticket_id + type queries
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_type 
ON public.ticket_attachments(ticket_id, attachment_type);

-- Verification: Check the updated schema
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ticket_attachments'
ORDER BY ordinal_position;

-- Verification: Check existing attachments
SELECT 
    COUNT(*) as total_attachments,
    attachment_type,
    COUNT(*) FILTER (WHERE attachment_type = 'work_evidence') as work_evidence_count,
    COUNT(*) FILTER (WHERE attachment_type = 'vendor_request') as vendor_request_count
FROM public.ticket_attachments
GROUP BY attachment_type;

COMMENT ON COLUMN public.ticket_attachments.attachment_type IS 
'Type of attachment: work_evidence (photos for progress tracking) or vendor_request (official documents for escalation)';
