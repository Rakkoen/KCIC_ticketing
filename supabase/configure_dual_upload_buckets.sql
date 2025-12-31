-- ========================================
-- Storage Bucket Configuration for Dual Upload Feature
-- ========================================
--
-- IMPORTANT: This script creates TWO SEPARATE BUCKETS
-- 1. ticket-work-evidence (for work progress photos)
-- 2. ticket-vendor-requests (for official vendor documents)
--
-- STEP 1: Run this SQL script
-- STEP 2: Configure policies in Supabase Dashboard (see instructions below)
-- ========================================

-- Create Bucket 1: Work Evidence Photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ticket-work-evidence',
    'ticket-work-evidence',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/heic']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/heic']::text[];

-- Create Bucket 2: Vendor Work Requests
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ticket-vendor-requests',
    'ticket-vendor-requests',
    true,
    5242880, -- 5MB
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[];

-- Verification: Check buckets were created
SELECT 
    name as "Bucket Name",
    public as "Public Access",
    file_size_limit as "Size Limit (bytes)",
    allowed_mime_types as "Allowed MIME Types",
    created_at
FROM storage.buckets
WHERE name IN ('ticket-work-evidence', 'ticket-vendor-requests')
ORDER BY name;

-- ========================================
-- NEXT STEPS: Configure Storage Policies via Dashboard
-- ========================================
--
-- After running this script, you MUST configure policies in Supabase Dashboard:
--
-- For EACH bucket (ticket-work-evidence AND ticket-vendor-requests):
--
-- 1. Go to: Storage → [bucket name] → Policies tab
-- 2. Click "New Policy"
-- 3. Create TWO policies:
--
--    Policy 1: Allow Upload
--    - Name: "Allow authenticated uploads"
--    - Allowed operation: INSERT
--    - Policy definition: 
--      (bucket_id = 'bucket-name-here') AND (auth.role() = 'authenticated')
--
--    Policy 2: Allow Download
--    - Name: "Allow public downloads"  
--    - Allowed operation: SELECT
--    - Policy definition:
--      bucket_id = 'bucket-name-here'
--
-- OR use these SQL commands (run separately for each bucket):
--
-- For ticket-work-evidence:
/*
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-work-evidence');

CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-work-evidence');
*/

-- For ticket-vendor-requests:
/*
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-vendor-requests');

CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-vendor-requests');
*/
