-- ========================================
-- IMPORT DATA TIKET HISTORICAL KCIC - FIXED
-- Using gen_random_uuid() for automatic UUID generation
-- ========================================

-- STEP 1: CREATE USERS WITH AUTO UUID
-- Reporters (Pelapor)
INSERT INTO public.users (email, full_name, role, availability_status) VALUES
('dina@kcic.co.id', 'Dina', 'employee', 'offline'),
('rivan@kcic.co.id', 'Rivan', 'employee', 'offline'),
('nisrina@kcic.co.id', 'Nisrina', 'employee', 'offline'),
('rista@kcic.co.id', 'A.Rista Putri', 'employee', 'offline'),
('ananda@kcic.co.id', 'Ananda', 'employee', 'offline'),
('fauzan@kcic.co.id', 'Fauzan', 'employee', 'offline'),
('devi@kcic.co.id', 'Devi', 'employee', 'offline'),
('nur.indriani@kcic.co.id', 'Nur Indriani', 'employee', 'offline'),
('febian@kcic.co.id', 'Febian', 'employee', 'offline'),
('nadio@kcic.co.id', 'Nadio', 'employee', 'offline'),
('riyadi@kcic.co.id', 'Riyadi', 'employee', 'offline'),
('fina@kcic.co.id', 'Fina', 'employee', 'offline'),
('titis@kcic.co.id', 'Titis', 'employee', 'offline'),
('hanifa@kcic.co.id', 'Siti Hanifa', 'employee', 'offline'),
('jee@kcic.co.id', 'Jee', 'employee', 'offline'),
('d ina.arofatun@kcic.co.id', 'Dina Arofatun Nahdiyah', 'employee', 'offline'),
('anggun@kcic.co.id', 'Anggun', 'employee', 'offline'),
('dania@kcic.co.id', 'Dania', 'employee', 'offline'),
('devi.hardhasari@kcic.co.id', 'Devi Hardhasari', 'employee', 'offline'),
('nadia.revi@kcic.co.id', 'Nadia Revi', 'employee', 'offline'),
('ayu.fatimah@kcic.co.id', 'Ayu Fatimah', 'employee', 'offline'),
('eko.budi@kcic.co.id', 'Eko Budi', 'employee', 'offline'),
('djanoe@kcic.co.id', 'Djanoe', 'employee', 'offline'),
('ubay@kcic.co.id', 'Ubay', 'employee', 'offline'),
('razy@kcic.co.id', 'Razy', 'employee', 'offline'),
('haikal@kcic.co.id', 'Haikal', 'employee', 'offline'),
('titis.ccr@kcic.co.id', 'Titis CCR PDG', 'employee', 'offline'),
(' ichram@kcic.co.id', 'Ichram Akbar', 'employee', 'offline'),
('azmi@kcic.co.id', 'Azmi Rifai', 'employee', 'offline'),
('theodore@kcic.co.id', 'Theodore', 'employee', 'offline'),
('triska@kcic.co.id', 'Triska', 'employee', 'offline'),
('ali.mahfud@kcic.co.id', 'Ali Mahfud', 'employee', 'offline'),
-- Managers
('anisa.amalia@kcic.co.id', 'Anisa Amalia', 'manager', 'available'),
('inna.m@kcic.co.id', 'Inna M', 'manager', 'available'),
('nisrina.hasna@kcic.co.id', 'Nisrina Hasna', 'manager', 'available'),
-- Technicians
('dastin@kcic.co.id', 'Dastin', 'technician', 'available'),
('alif.firdaus@kcic.co.id', 'Alif Firdaus', 'technician', 'available'),
('jalu@kcic.co.id', 'Jalu', 'technician', 'available'),
('muhammad.rizal@kcic.co.id', 'Muhamad Rizal', 'technician', 'available'),
('alif.ghifari@kcic.co.id', 'Alif Al Ghifari', 'technician', 'available'),
('fatah@kcic.co.id', 'Fatah', 'technician', 'available'),
('egi.yudhistira@kcic.co.id', 'Egi Yudhistira', 'technician', 'available'),
('psac@kcic.co.id', 'PSAC', 'technician', 'available')
ON CONFLICT (email) DO NOTHING;

-- STEP 2: INSERT TICKETS USING EMAIL LOOKUP
-- This will look up user IDs by email

-- Ticket 1
INSERT INTO public.tickets (custom_id, title, description, priority, status, station, equipment_category, created_by, created_at, first_response_at, resolved_at)
SELECT 'HPIO-INC-041225-001', 'TVM 401 tidak berfungsi (abnormal)', 'tidak berfungsi (abnormal)', 'medium', 'closed', 'Tegalluar', 'TVM 401', id, '2025-12-23 07:35:00', '2025-12-23 07:41:00', '2025-12-23 09:38:00'
FROM public.users WHERE email = 'dina@kcic.co.id';

-- Tickets 2-28 (Without technician)
INSERT INTO public.tickets (custom_id, title, description, priority, status, station, equipment_category, created_by, created_at)
SELECT * FROM (VALUES
    ('HPIO-INC-011225-002', 'Tiket tersangkut di loket 2', 'Tiket tersangkut di loket 2', 'high', 'closed', 'Halim', 'Loket 2', (SELECT id FROM users WHERE email = 'rivan@kcic.co.id'), '2025-12-23 00:00:00'::timestamp),
    ('HPIO-INC-011225-003', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Halim', 'Stasiun Announcement', (SELECT id FROM users WHERE email = 'nisrina@kcic.co.id'), '2025-12-23 00:00:00'::timestamp),
    ('HP IO-INC-021225-004', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Karawang', 'Stasiun Announcement', (SELECT id FROM users WHERE email = 'nisrina@kcic.co.id'), '2025-12-23 00:00:00'::timestamp),
    ('HPIO-INC-031225-005', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Padalarang', 'Stasiun Announcement', (SELECT id FROM users WHERE email = 'nisrina@kcic.co.id'), '2025-12-23 00:00:00'::timestamp),
    ('HPIO-INC-041225-006', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Tegalluar', 'Stasiun Announcement', (SELECT id FROM users WHERE email = 'nisrina@kcic.co.id'), '2025-12-23 00:00:00'::timestamp),
    ('HP IO-INC-041225-007', 'Mes

in tiket pintu keluar No. 013 tidak scan QR', 'Terkendala tidak menyescan QR', 'critical', 'closed', 'Tegalluar', 'Mesin tiket pintu keluar No. 013', (SELECT id FROM users WHERE email = 'rista@kcic.co.id'), '2025-12-23 00:00:00'::timestamp)
) AS t(custom_id, title, description, priority, status, station, equipment_category, created_by, created_at);

-- Continue with simple approach - one by one for clarity
INSERT INTO public.tickets (custom_id, title, description, priority, status, station, equipment_category, created_by, assigned_to, created_at, first_response_at, resolved_at)
SELECT 'HPIO-INC-010126-001', 'TVM 104 tiket menyangkut', 'Penangguhan TVM 104 disebabkan tiket menyangkut', 'critical', 'closed', 'Halim', 'TVM 104', 
    (SELECT id FROM users WHERE email = 'eko.budi@kcic.co.id'), 
    (SELECT id FROM users WHERE email = 'dastin@kcic.co.id'), 
    '2026-01-01 10:34:00', '2026-01-01 10:35:00', '2026-01-01 10:50:00';

-- Verify
SELECT COUNT(*) as total_tickets FROM public.tickets WHERE custom_id LIKE 'HPIO-%';
SELECT COUNT(*) as total_users FROM public.users;
SELECT COUNT(*) as total_technicians FROM public.users WHERE role = 'technician';
