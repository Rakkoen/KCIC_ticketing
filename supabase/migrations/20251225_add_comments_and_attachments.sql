-- Create ticket_comments table
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
-- Everyone can view comments for tickets they have access to (simplified for now: authenticated users)
CREATE POLICY "Authenticated users can view comments"
    ON public.ticket_comments FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
    ON public.ticket_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create ticket_attachments table
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
-- Authenticated users can view attachments
CREATE POLICY "Authenticated users can view attachments"
    ON public.ticket_attachments FOR SELECT
    TO authenticated
    USING (true);

-- Only creating attachments is allowed by the uploader (controller by app logic usually, but here strict RLS)
CREATE POLICY "Users can upload attachments"
    ON public.ticket_attachments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

-- Storage Bucket Setup (via SQL is possible in Supabase if extensions/permissions allow, otherwise manual)
-- Attempting to insert into storage.buckets if it exists (standard Supabase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ticket-attachments', 'ticket-attachments', true, 1048576, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies
-- Allow public access to read files (or restricted to authenticated, let's go with authenticated for safety)
CREATE POLICY "Give access to authenticated users"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'ticket-attachments');

-- Allow uploads
CREATE POLICY "Allow uploads for authenticated users"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'ticket-attachments');
