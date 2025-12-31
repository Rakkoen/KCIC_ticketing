-- ========================================
-- Storage Policies for Dual Upload Buckets
-- ========================================
-- 
-- Run this AFTER creating the buckets with configure_dual_upload_buckets.sql
-- These policies allow authenticated users to upload and everyone to download
-- ========================================

-- Clean up any existing policies first
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "work_evidence_insert" ON storage.objects;
DROP POLICY IF EXISTS "work_evidence_select" ON storage.objects;
DROP POLICY IF EXISTS "vendor_request_insert" ON storage.objects;
DROP POLICY IF EXISTS "vendor_request_select" ON storage.objects;

-- ========================================
-- Policies for ticket-work-evidence bucket
-- ========================================

-- Allow authenticated users to upload to work evidence bucket
CREATE POLICY "work_evidence_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-work-evidence');

-- Allow everyone to download from work evidence bucket
CREATE POLICY "work_evidence_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-work-evidence');

-- ========================================
-- Policies for ticket-vendor-requests bucket
-- ========================================

-- Allow authenticated users to upload to vendor requests bucket
CREATE POLICY "vendor_request_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-vendor-requests');

-- Allow everyone to download from vendor requests bucket
CREATE POLICY "vendor_request_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-vendor-requests');

-- ========================================
-- Verification
-- ========================================

-- Check that policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%work_evidence%' OR policyname LIKE '%vendor_request%'
ORDER BY policyname;
