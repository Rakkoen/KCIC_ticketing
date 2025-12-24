-- Universal Seed Data for Tickets and Incidents
-- This migration creates sample data that can be accessed by all users regardless of role

-- Get the first user ID to use for all sample data
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    SELECT id INTO sample_user_id 
    FROM public.users 
    LIMIT 1;
    
    -- Insert sample tickets
    INSERT INTO public.tickets (title, description, status, priority, created_by, assigned_to) VALUES
    ('CRM Application Error', 'Aplikasi CRM error saat generate laporan bulanan. Error message: "Connection timeout to database"', 'new', 'critical', sample_user_id, sample_user_id),
    
    ('Tidak Akses Folder Bersama', 'Tidak dapat mengakses folder shared \\server\finance. Muncul error "Access denied"', 'in_progress', 'high', sample_user_id, sample_user_id),
    
    ('VPN Tidak Bisa Connect', 'VPN connection timeout saat mencoba connect dari rumah. Sudah coba restart komputer masih sama', 'new', 'high', sample_user_id, sample_user_id),
    
    ('Printer Lantai 2 Error', 'Printer di lantai 2 tidak bisa print. Lampu indikator blinking orange', 'in_progress', 'medium', sample_user_id, sample_user_id),
    
    ('Email Sync Lambat', 'Email Outlook tidak sync dengan server. Email baru tidak masuk selama 2 jam', 'new', 'medium', sample_user_id, sample_user_id),
    
    ('Komputer Lemot', 'Komputer sangat lambat saat buka aplikasi. Butuh 5 menit untuk booting', 'in_progress', 'medium', sample_user_id, sample_user_id),
    
    ('Request Software Baru', 'Mohon install Adobe Photoshop untuk keperluan design marketing', 'new', 'low', sample_user_id, sample_user_id),
    
    ('Monitor Flicker', 'Monitor utama kadang flicker terutama saat buka aplikasi grafis', 'new', 'low', sample_user_id, sample_user_id),
    
    ('Password Reset', 'Lupa password email, mohon reset password', 'resolved', 'medium', sample_user_id, sample_user_id),
    
    ('Update Software', 'Update antivirus ke versi terbaru', 'closed', 'low', sample_user_id, sample_user_id);
END $$;

-- Insert sample incidents
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    SELECT id INTO sample_user_id 
    FROM public.users 
    LIMIT 1;
    
    INSERT INTO public.incidents (
        title, description, severity, status, impact, urgency, category, 
        affected_systems, affected_users, estimated_downtime_minutes, 
        actual_downtime_minutes, detected_at, created_by, assigned_to,
        root_cause_analysis, resolution_summary
    ) VALUES
    ('Database Server Down', 'Database server utama tidak responsif. Semua aplikasi yang bergantung ke database terdampak', 
        'critical', 'resolved', 'critical', 'critical', 'infrastructure', 
        ARRAY['database', 'crm', 'erp', 'website'], 150, 60, 45, 
        NOW() - INTERVAL '3 days', sample_user_id, sample_user_id,
        'Memory leak di database server menyebabkan crash',
        'Database server direstart dan dioptimize. Memory upgrade dilakukan'),
    
    ('Email Service Outage', 'Layanan email down untuk semua user. Tidak bisa kirim dan terima email', 
        'high', 'resolved', 'high', 'high', 'communication', 
        ARRAY['email', 'exchange', 'outlook'], 200, 120, 90, 
        NOW() - INTERVAL '5 days', sample_user_id, sample_user_id,
        'Corrupted mail queue di Exchange server',
        'Exchange server direstart dan mail queue dibersihkan'),
    
    ('Network Down Gedung B', 'Tidak ada koneksi internet di gedung B sejak pagi', 
        'high', 'investigating', 'high', 'high', 'network', 
        ARRAY['network', 'internet', 'wifi'], 50, NULL, NULL, 
        NOW() - INTERVAL '1 day', sample_user_id, sample_user_id,
        NULL, NULL),
    
    ('VPN Service Degradation', 'Layanan VPN sangat lambat, remote work jadi tidak produktif', 
        'medium', 'open', 'medium', 'medium', 'network', 
        ARRAY['vpn', 'remote-access'], 30, NULL, NULL, 
        NOW() - INTERVAL '2 hours', sample_user_id, sample_user_id,
        NULL, NULL),
    
    ('Website Performance Issues', 'Website perusahaan loading sangat lambat untuk user eksternal', 
        'medium', 'investigating', 'medium', 'medium', 'web', 
        ARRAY['website', 'cms'], 0, NULL, NULL, 
        NOW() - INTERVAL '4 hours', sample_user_id, sample_user_id,
        NULL, NULL),
    
    ('Scheduled Maintenance', 'Maintenance terjadwal untuk file server. Beberapa user mungkin mengalami gangguan sementara', 
        'low', 'closed', 'low', 'low', 'infrastructure', 
        ARRAY['file-server'], 20, 30, 25, 
        NOW() - INTERVAL '7 days', sample_user_id, sample_user_id,
        'Maintenance rutin bulanan',
        'Maintenance selesai, semua sistem normal kembali');
END $$;

-- Link tickets to incidents
DO $$
DECLARE
    sample_user_id UUID;
    incident_db_id UUID;
    incident_email_id UUID;
    incident_network_id UUID;
    incident_website_id UUID;
    ticket_crm_id UUID;
    ticket_computer_id UUID;
    ticket_email_id UUID;
    ticket_vpn_id UUID;
    ticket_monitor_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO sample_user_id 
    FROM public.users 
    LIMIT 1;
    
    -- Get incident IDs
    SELECT id INTO incident_db_id FROM public.incidents WHERE title = 'Database Server Down' LIMIT 1;
    SELECT id INTO incident_email_id FROM public.incidents WHERE title = 'Email Service Outage' LIMIT 1;
    SELECT id INTO incident_network_id FROM public.incidents WHERE title = 'Network Down Gedung B' LIMIT 1;
    SELECT id INTO incident_website_id FROM public.incidents WHERE title = 'Website Performance Issues' LIMIT 1;
    
    -- Get ticket IDs
    SELECT id INTO ticket_crm_id FROM public.tickets WHERE title = 'CRM Application Error' LIMIT 1;
    SELECT id INTO ticket_computer_id FROM public.tickets WHERE title = 'Komputer Lemot' LIMIT 1;
    SELECT id INTO ticket_email_id FROM public.tickets WHERE title = 'Email Sync Lambat' LIMIT 1;
    SELECT id INTO ticket_vpn_id FROM public.tickets WHERE title = 'VPN Tidak Bisa Connect' LIMIT 1;
    SELECT id INTO ticket_monitor_id FROM public.tickets WHERE title = 'Monitor Flicker' LIMIT 1;
    
    -- Link tickets to incidents
    IF incident_db_id IS NOT NULL AND ticket_crm_id IS NOT NULL THEN
        INSERT INTO public.incident_tickets (incident_id, ticket_id) VALUES (incident_db_id, ticket_crm_id);
    END IF;
    
    IF incident_db_id IS NOT NULL AND ticket_computer_id IS NOT NULL THEN
        INSERT INTO public.incident_tickets (incident_id, ticket_id) VALUES (incident_db_id, ticket_computer_id);
    END IF;
    
    IF incident_email_id IS NOT NULL AND ticket_email_id IS NOT NULL THEN
        INSERT INTO public.incident_tickets (incident_id, ticket_id) VALUES (incident_email_id, ticket_email_id);
    END IF;
    
    IF incident_network_id IS NOT NULL AND ticket_vpn_id IS NOT NULL THEN
        INSERT INTO public.incident_tickets (incident_id, ticket_id) VALUES (incident_network_id, ticket_vpn_id);
    END IF;
    
    IF incident_website_id IS NOT NULL AND ticket_monitor_id IS NOT NULL THEN
        INSERT INTO public.incident_tickets (incident_id, ticket_id) VALUES (incident_website_id, ticket_monitor_id);
    END IF;
END $$;

-- Create incident history
DO $$
DECLARE
    sample_user_id UUID;
    incident_db_id UUID;
    incident_email_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO sample_user_id 
    FROM public.users 
    LIMIT 1;
    
    -- Get incident IDs
    SELECT id INTO incident_db_id FROM public.incidents WHERE title = 'Database Server Down' LIMIT 1;
    SELECT id INTO incident_email_id FROM public.incidents WHERE title = 'Email Service Outage' LIMIT 1;
    
    -- Create history for Database Server Down
    IF incident_db_id IS NOT NULL THEN
        INSERT INTO public.incident_history (incident_id, action, new_values, changed_by) VALUES
        (incident_db_id, 'CREATE', 
         '{"status": "open", "severity": "critical", "impact": "critical"}', 
         sample_user_id),
         
        (incident_db_id, 'UPDATE', 
         '{"status": "investigating"}', 
         sample_user_id),
         
        (incident_db_id, 'UPDATE', 
         '{"status": "resolved", "resolution_summary": "Database server direstart dan dioptimize. Performa meningkat 40%."}', 
         sample_user_id);
    END IF;
    
    -- Create history for Email Service Outage
    IF incident_email_id IS NOT NULL THEN
        INSERT INTO public.incident_history (incident_id, action, new_values, changed_by) VALUES
        (incident_email_id, 'CREATE', 
         '{"status": "open", "severity": "high", "impact": "high"}', 
         sample_user_id),
         
        (incident_email_id, 'UPDATE', 
         '{"status": "investigating"}', 
         sample_user_id),
         
        (incident_email_id, 'UPDATE', 
         '{"status": "resolved", "resolution_summary": "Exchange server dipatch dan direstart. Email queue dibersihkan."}', 
         sample_user_id);
    END IF;
END $$;