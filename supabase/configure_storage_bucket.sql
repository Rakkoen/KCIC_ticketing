-- ========================================
-- Supabase Storage Bucket Configuration
-- ========================================
--
-- INSTRUCTIONS:
-- This SQL cannot update storage bucket settings directly.
-- You MUST update the bucket via the Supabase Dashboard manually:
--
-- 1. Go to: Supabase Dashboard → Storage → ticket-attachments
-- 2. Click "Edit Bucket" (gear icon)
-- 3. Update settings:
--    - File size limit: 5000000 bytes (5MB)
--    - Allowed MIME types:
--      application/pdf
--      image/jpeg
--      image/png
--      image/heic
-- 4. Save changes
--
-- ========================================

-- Verify that the bucket exists
SELECT 
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'ticket-attachments';

-- If the bucket doesn't exist, create it
-- Note: This will fail if bucket already exists, which is fine
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ticket-attachments',
    'ticket-attachments',
    true,
    5000000, -- 5MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 5000000,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic']::text[];

-- Verify the update
SELECT 
    name as "Bucket Name",
    public as "Public",
    file_size_limit as "Size Limit (bytes)",
    allowed_mime_types as "Allowed Types"
FROM storage.buckets
WHERE name = 'ticket-attachments';
