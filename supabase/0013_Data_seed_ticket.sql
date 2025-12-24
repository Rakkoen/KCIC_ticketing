-- Clear existing ticket data
TRUNCATE TABLE public.tickets CASCADE;

-- Insert new seed data
WITH sample_users AS (
    SELECT id FROM public.users LIMIT 1
)
INSERT INTO public.tickets (
    title, 
    description, 
    priority, 
    status, 
    station, 
    created_by, 
    created_at,
    updated_at
)
SELECT 
    t.title,
    t.description,
    t.priority::text::public.ticket_priority, -- explicit cast if custom enum
    t.status::text::public.ticket_status,     -- explicit cast if custom enum
    t.station,
    u.id,
    NOW() - (t.p_interval),
    NOW()
FROM sample_users u
CROSS JOIN (
    VALUES 
        ('AC Malfunction in Waiting Area', 'The air conditioning system in the main waiting area (Zone A) is blowing warm air. Passengers are complaining about the heat.', 'high', 'open', 'Halim', INTERVAL '2 hours'),
        ('Ticket Machine #4 Paper Jam', 'Ticket vending machine #4 is constantly jamming. Needs internal cleaning and roller inspection.', 'medium', 'in_progress', 'Padalarang', INTERVAL '1 day'),
        ('Platform Lighting Issue', 'Several LED panels on Platform 2 are flickering. Safety hazard for night operations.', 'critical', 'on_escalation', 'Tegalluar', INTERVAL '3 hours'),
        ('Restroom Cleaning Request', 'Mens restroom on 2nd floor needs urgent cleaning and restocking of supplies.', 'low', 'resolved', 'Karawang', INTERVAL '4 days'),
        ('Gate 3 Sensor Error', 'Automatic gate at entrance 3 is not detecting passengers consistently. Slowing down entry flow.', 'high', 'open', 'Halim', INTERVAL '30 minutes'),
        ('Lost Item Report: Black Backpack', 'Passenger reported lost black backpack in waiting room B. Security has been notified.', 'medium', 'closed', 'Depo Tegal Luar', INTERVAL '1 week'),
        ('WiFi Connectivity Drop', 'Public WiFi signal weak near the food court area. Access points need checking.', 'low', 'open', 'Padalarang', INTERVAL '5 hours'),
        ('Escalator E-02 Strange Noise', 'Escalator leading to platform 1 makes a grinding noise during operation.', 'critical', 'in_progress', 'Halim', INTERVAL '1 day'),
        ('Signage Damaged', 'Directional signage to taxi stand has been damaged/scratched.', 'low', 'open', 'Tegalluar', INTERVAL '2 days'),
        ('Water Dispenser Empty', 'Water dispenser in staff break room 2 is empty and needs bottle replacement.', 'low', 'resolved', 'Karawang', INTERVAL '6 hours')
) AS t(title, description, priority, status, station, p_interval);
