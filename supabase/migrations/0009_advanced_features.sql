-- Comments/Activity Feed Table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Incident Comments Table
CREATE TABLE IF NOT EXISTS public.incident_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activity Log Table (for audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'ticket', 'incident', 'user', etc.
    entity_id UUID NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    email_notifications BOOLEAN DEFAULT true,
    desktop_notifications BOOLEAN DEFAULT false,
    notification_frequency TEXT DEFAULT 'realtime' CHECK (notification_frequency IN ('realtime', 'hourly', 'daily')),
    default_view TEXT DEFAULT 'grid' CHECK (default_view IN ('grid', 'list', 'kanban')),
    items_per_page INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON public.ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user ON public.ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident ON public.incident_comments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_comments_user ON public.incident_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_ticket_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_comments_updated_at
    BEFORE UPDATE ON public.ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_comment_updated_at();

CREATE OR REPLACE FUNCTION update_incident_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incident_comments_updated_at
    BEFORE UPDATE ON public.incident_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_incident_comment_updated_at();

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_details JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for ticket_comments
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by authenticated users" ON public.ticket_comments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert comments" ON public.ticket_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON public.ticket_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.ticket_comments
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for incident_comments
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Incident comments are viewable by authenticated users" ON public.incident_comments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert incident comments" ON public.incident_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own incident comments" ON public.incident_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own incident comments" ON public.incident_comments
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- RLS Policies for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incident_comments TO authenticated;
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION log_activity TO authenticated;

-- Comments
COMMENT ON TABLE public.ticket_comments IS 'Comments and discussion on tickets';
COMMENT ON TABLE public.incident_comments IS 'Comments and discussion on incidents';
COMMENT ON TABLE public.activity_logs IS 'Audit trail of all system actions';
COMMENT ON TABLE public.user_preferences IS 'User-specific application preferences and settings';
