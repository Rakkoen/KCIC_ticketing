-- Extend users table for worker management
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'offline' CHECK (availability_status IN ('online', 'busy', 'offline')),
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create index for availability lookups
CREATE INDEX IF NOT EXISTS idx_users_availability ON public.users(availability_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON public.users(last_active_at);

-- Worker statistics view
CREATE OR REPLACE VIEW public.worker_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.role,
    u.availability_status,
    u.last_active_at,
    -- Ticket stats
    COUNT(DISTINCT t.id) FILTER (WHERE t.assigned_to = u.id) as tickets_assigned,
    COUNT(DISTINCT t.id) FILTER (WHERE t.assigned_to = u.id AND t.status = 'new') as tickets_new,
    COUNT(DISTINCT t.id) FILTER (WHERE t.assigned_to = u.id AND t.status = 'in_progress') as tickets_in_progress,
    COUNT(DISTINCT t.id) FILTER (WHERE t.assigned_to = u.id AND t.status = 'resolved') as tickets_resolved,
    COUNT(DISTINCT t.id) FILTER (WHERE t.assigned_to = u.id AND t.status = 'closed') as tickets_closed,
    -- Incident stats
    COUNT(DISTINCT i.id) FILTER (WHERE i.assigned_to = u.id) as incidents_assigned,
    COUNT(DISTINCT i.id) FILTER (WHERE i.assigned_to = u.id AND i.status IN ('open', 'investigating')) as incidents_active
FROM public.users u
LEFT JOIN public.tickets t ON t.assigned_to = u.id
LEFT JOIN public.incidents i ON i.assigned_to = u.id
WHERE u.role IN ('admin', 'manager', 'worker')
GROUP BY u.id, u.email, u.full_name, u.role, u.availability_status, u.last_active_at;

-- Function to update last active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.availability_status != OLD.availability_status OR NEW.availability_status = 'online' THEN
        NEW.last_active_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for last active updates
DROP TRIGGER IF EXISTS update_user_last_active_trigger ON public.users;
CREATE TRIGGER update_user_last_active_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Function to get worker workload
CREATE OR REPLACE FUNCTION get_worker_workload(worker_id UUID)
RETURNS TABLE (
    total_assigned INTEGER,
    active_tickets INTEGER,
    active_incidents INTEGER,
    avg_response_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT t.id)::INTEGER as total_assigned,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('new', 'in_progress'))::INTEGER as active_tickets,
        COUNT(DISTINCT i.id) FILTER (WHERE i.status IN ('open', 'investigating'))::INTEGER as active_incidents,
        AVG(t.updated_at - t.created_at) as avg_response_time
    FROM public.users u
    LEFT JOIN public.tickets t ON t.assigned_to = u.id
    LEFT JOIN public.incidents i ON i.assigned_to = u.id
    WHERE u.id = worker_id
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on the view
GRANT SELECT ON public.worker_stats TO authenticated;

-- RLS policy to allow users to update their own availability
CREATE POLICY "Users can update their own availability" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Comment for documentation
COMMENT ON VIEW public.worker_stats IS 'Aggregated statistics for workers including ticket and incident counts';
COMMENT ON FUNCTION get_worker_workload IS 'Returns detailed workload information for a specific worker';
