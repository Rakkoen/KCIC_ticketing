-- Seed data for tickets with new reporting fields
-- This migration creates sample tickets with all required fields populated

-- Insert sample tickets with complete data including new fields
INSERT INTO public.tickets (
    title,
    description,
    status,
    priority,
    station,
    location,
    equipment_category,
    escalation_status,
    comments,
    created_by,
    assigned_to
) VALUES
-- Ticket 1: High priority electrical issue
(
    'Platform lighting system malfunction',
    'The main lighting system at Platform 2 is flickering and some lights are completely off. This poses a safety risk for passengers during evening hours.',
    'in_progress',
    'high',
    'Halim',
    'Platform 2',
    'Electrical',
    'no',
    'Initial inspection completed. Found faulty circuit breaker. Replacement parts ordered.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1)
),

-- Ticket 2: Critical escalated issue
(
    'Air conditioning failure in main hall',
    'Complete HVAC system failure in the main passenger waiting hall. Temperature exceeding 35°C. Immediate action required.',
    'on_escalation',
    'critical',
    'Karawang',
    'Main Hall',
    'HVAC',
    'yes',
    'HVAC contractor contacted. System requires full replacement. Escalated to management for budget approval.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1)
),

-- Ticket 3: IT infrastructure
(
    'Ticketing kiosk touchscreen not responding',
    'Self-service ticketing kiosk #3 has unresponsive touchscreen. Passengers unable to purchase tickets.',
    'open',
    'medium',
    'Padalarang',
    'Entrance Gate 1',
    'IT',
    'no',
    NULL,
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    NULL
),

-- Ticket 4: Mechanical issue
(
    'Escalator making unusual noise',
    'Main escalator to Platform 1 is making grinding noise and vibrating. Possible bearing failure.',
    'in_progress',
    'high',
    'Tegalluar',
    'Platform 1 Access',
    'Mechanical',
    'pending',
    'Maintenance team inspecting. May need to shut down for repairs during off-peak hours.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1)
),

-- Ticket 5: Civil/structural
(
    'Ceiling water leak after rain',
    'Water leaking from ceiling in waiting area. Appears to be roof drainage issue.',
    'resolved',
    'medium',
    'Halim',
    'Waiting Area Section B',
    'Civil',
    'no',
    'Roof inspection completed. Drainage pipe was clogged. Cleaned and sealed. Monitoring for next rainfall.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1)
),

-- Ticket 6: Plumbing
(
    'Toilet faucet continuous water flow',
    'Multiple faucets in public restroom have continuous water flow. Water wastage concern.',
    'open',
    'low',
    'Karawang',
    'Public Restroom - Floor 1',
    'Plumbing',
    'no',
    NULL,
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1)
),

-- Ticket 7: Safety equipment
(
    'Fire extinguisher expired',
    'Annual inspection found 5 fire extinguishers past expiration date in Platform 3 area.',
    'in_progress',
    'critical',
    'Padalarang',
    'Platform 3',
    'Safety',
    'no',
    'Replacement order placed. Temporary units installed. Permanent replacements arriving next week.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1)
),

-- Ticket 8: Other category
(
    'Signage damage - directional signs unclear',
    'Several directional signs damaged and text faded. Passengers reporting difficulty finding platforms.',
    'open',
    'medium',
    'Tegalluar',
    'Main Concourse',
    'Other',
    'no',
    NULL,
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    NULL
),

-- Ticket 9: Electrical - Escalated
(
    'Power outage in ticket office',
    'Complete power loss in ticket sales office. Backup generator not functioning.',
    'on_escalation',
    'critical',
    'Halim',
    'Ticket Office',
    'Electrical',
    'yes',
    'Emergency electrician called. Power company notified. Backup generator requires major repair. Escalated for emergency procurement.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1)
),

-- Ticket 10: IT - Closed
(
    'WiFi signal weak in waiting area',
    'Passengers complaining about weak WiFi signal strength in main waiting area.',
    'closed',
    'low',
    'Karawang',
    'Waiting Area',
    'IT',
    'no',
    'Additional WiFi access point installed. Signal strength improved. Tested and verified. Closed after 2 days monitoring.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1)
),

-- Ticket 11: Mechanical - High Priority
(
    'Automatic door sensor malfunction',
    'Main entrance automatic doors not opening properly. Sensor appears faulty.',
    'in_progress',
    'high',
    'Padalarang',
    'Main Entrance',
    'Mechanical',
    'no',
    'Sensor cleaning attempted. Issue persists. Replacement sensor ordered.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' LIMIT 1)
),

-- Ticket 12: HVAC - Resolved
(
    'Ventilation fan noise in restroom',
    'Loud rattling noise from ventilation fan in staff restroom.',
    'resolved',
    'low',
    'Tegalluar',
    'Staff Restroom',
    'HVAC',
    'no',
    'Fan motor bearing lubricated. Noise eliminated. Scheduled for replacement in next maintenance cycle.',
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1),
    (SELECT id FROM public.users WHERE email LIKE '%@%' OFFSET 1 LIMIT 1)
);

-- Update timestamps to create realistic timeline
UPDATE public.tickets SET 
    created_at = NOW() - INTERVAL '10 days',
    updated_at = NOW() - INTERVAL '9 days'
WHERE title LIKE '%WiFi%';

UPDATE public.tickets SET 
    created_at = NOW() - INTERVAL '7 days',
    updated_at = NOW() - INTERVAL '6 days'
WHERE title LIKE '%water leak%';

UPDATE public.tickets SET 
    created_at = NOW() - INTERVAL '5 days',
    updated_at = NOW() - INTERVAL '2 days'
WHERE title LIKE '%air conditioning%' OR title LIKE '%Power outage%';

UPDATE public.tickets SET 
    created_at = NOW() - INTERVAL '3 days',
    updated_at = NOW() - INTERVAL '1 day'
WHERE title LIKE '%lighting%' OR title LIKE '%Fire extinguisher%';

UPDATE public.tickets SET 
    created_at = NOW() - INTERVAL '2 days',
    updated_at = NOW() - INTERVAL '1 day'
WHERE title LIKE '%Escalator%' OR title LIKE '%automatic door%';

UPDATE public.tickets SET 
    created_at = NOW() - INTERVAL '1 day',
    updated_at = NOW()
WHERE title LIKE '%Ticketing kiosk%' OR title LIKE '%Toilet%' OR title LIKE '%Signage%';

UPDATE public.tickets SET 
    created_at = NOW() - INTERVAL '4 days',
    updated_at = NOW() - INTERVAL '3 days'
WHERE title LIKE '%Ventilation%';

-- Add some comments to tickets
INSERT INTO public.ticket_comments (ticket_id, user_id, content)
SELECT 
    t.id,
    t.created_by,
    'Status update: ' || 
    CASE 
        WHEN t.status = 'in_progress' THEN 'Currently working on this issue. Will update soon.'
        WHEN t.status = 'on_escalation' THEN 'This has been escalated to management for urgent action.'
        WHEN t.status = 'resolved' THEN 'Issue has been resolved. Marking as complete.'
        ELSE 'Initial assessment in progress.'
    END
FROM public.tickets t
WHERE t.status IN ('in_progress', 'on_escalation', 'resolved')
LIMIT 5;

COMMENT ON COLUMN public.tickets.location IS 'Specific physical location within the station';
COMMENT ON COLUMN public.tickets.equipment_category IS 'Type of equipment/asset involved in the ticket';
COMMENT ON COLUMN public.tickets.wr_document_number IS 'Work Request document number, auto-generated when escalated';
COMMENT ON COLUMN public.tickets.escalation_status IS 'Whether ticket has been escalated: yes, no, pending';
COMMENT ON COLUMN public.tickets.comments IS 'Internal troubleshooting notes and comments';
