-- Seed data for tickets and incidents tables
-- This migration creates sample data for testing purposes

-- First, let's get the user IDs from the test accounts created in migration 0003
-- We'll use these IDs for created_by and assigned_to fields

-- Insert sample tickets
INSERT INTO public.tickets (title, description, status, priority, created_by, assigned_to) VALUES
('Login issue on dashboard', 'User cannot login to the dashboard after password reset. Getting error message "Invalid credentials" even with correct password.', 'new', 'high', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Printer not working', 'Network printer on floor 3 is not responding. Multiple users reported the issue.', 'in_progress', 'medium', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Software installation request', 'Need Adobe Creative Suite installed on design workstation.', 'resolved', 'low', 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('VPN connection problems', 'Cannot connect to VPN from home. Connection times out after 30 seconds.', 'new', 'high', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Email sync issues', 'Outlook is not syncing emails properly. Some emails are missing from inbox.', 'in_progress', 'medium', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Monitor flickering', 'Primary monitor flickers intermittently, especially when opening graphics-heavy applications.', 'closed', 'low', 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Access denied to shared folder', 'Cannot access shared folder \\server\projects. Getting "Access denied" error.', 'new', 'high', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Slow system performance', 'Computer running very slow, taking 5+ minutes to boot up.', 'in_progress', 'medium', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Application crash', 'CRM application crashes when trying to generate reports.', 'resolved', 'critical', 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Network outage', 'No internet connection in building B since this morning.', 'closed', 'critical', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1));

-- Insert sample incidents
INSERT INTO public.incidents (
    title, description, severity, status, impact, urgency, category, 
    affected_systems, affected_users, estimated_downtime_minutes, 
    actual_downtime_minutes, detected_at, created_by, assigned_to
) VALUES
('Database server down', 'Primary database server is unresponsive. All applications dependent on database are affected.', 
    'critical', 'resolved', 'critical', 'critical', 'infrastructure', 
    ARRAY['database', 'crm', 'erp'], 150, 60, 45, 
    NOW() - INTERVAL '2 days', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1)),
    
('Email service outage', 'Email service is down for all users. Cannot send or receive emails.', 
    'high', 'resolved', 'high', 'high', 'communication', 
    ARRAY['email', 'exchange'], 200, 120, 90, 
    NOW() - INTERVAL '5 days', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1)),
    
('VPN service degradation', 'VPN service is extremely slow, making remote work nearly impossible.', 
    'medium', 'investigating', 'medium', 'medium', 'network', 
    ARRAY['vpn', 'remote-access'], 50, NULL, NULL, 
    NOW() - INTERVAL '1 day', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1)),
    
('Website performance issues', 'Company website is loading very slowly for external users.', 
    'medium', 'open', 'medium', 'medium', 'web', 
    ARRAY['website', 'cms'], 0, NULL, NULL, 
    NOW() - INTERVAL '3 hours', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1)),
    
('File server maintenance', 'Scheduled maintenance on file server. Some users may experience temporary access issues.', 
    'low', 'closed', 'low', 'low', 'infrastructure', 
    ARRAY['file-server'], 30, 30, 25, 
    NOW() - INTERVAL '7 days', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),
    
('Security alert', 'Suspicious login attempts detected from multiple IP addresses.', 
    'high', 'investigating', 'high', 'high', 'security', 
    ARRAY['authentication', 'firewall'], 0, NULL, NULL, 
    NOW() - INTERVAL '6 hours', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1));

-- Link some tickets to incidents
INSERT INTO public.incident_tickets (incident_id, ticket_id) VALUES
-- Link tickets to database server incident
((SELECT id FROM public.incidents WHERE title = 'Database server down' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'Slow system performance' LIMIT 1)),
((SELECT id FROM public.incidents WHERE title = 'Database server down' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'Application crash' LIMIT 1)),

-- Link tickets to email service outage
((SELECT id FROM public.incidents WHERE title = 'Email service outage' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'Email sync issues' LIMIT 1)),

-- Link tickets to VPN service degradation
((SELECT id FROM public.incidents WHERE title = 'VPN service degradation' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'VPN connection problems' LIMIT 1)),

-- Link tickets to security alert
((SELECT id FROM public.incidents WHERE title = 'Security alert' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'Login issue on dashboard' LIMIT 1));

-- Create some incident history entries
INSERT INTO public.incident_history (incident_id, action, new_values, changed_by) VALUES
-- Database server incident history
((SELECT id FROM public.incidents WHERE title = 'Database server down' LIMIT 1), 
 'CREATE', 
 '{"status": "open", "severity": "critical", "impact": "critical"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Database server down' LIMIT 1), 
 'UPDATE', 
 '{"status": "investigating", "assigned_to": "' || (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1) || '"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Database server down' LIMIT 1), 
 'UPDATE', 
 '{"status": "resolved", "resolution_summary": "Database server restarted and optimized. Performance improved by 40%."}', 
 (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1)),

-- Email service incident history
((SELECT id FROM public.incidents WHERE title = 'Email service outage' LIMIT 1), 
 'CREATE', 
 '{"status": "open", "severity": "high", "impact": "high"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Email service outage' LIMIT 1), 
 'UPDATE', 
 '{"status": "investigating", "assigned_to": "' || (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1) || '"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Email service outage' LIMIT 1), 
 'UPDATE', 
 '{"status": "resolved", "resolution_summary": "Exchange server patched and restarted. Email queue cleared."}', 
 (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1));