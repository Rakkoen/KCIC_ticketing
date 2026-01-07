-- ========================================
-- IMPORT HISTORICAL TICKET DATA
-- Data seed untuk testing dengan data real KCIC
-- ========================================

-- CATATAN PENTING:
-- 1. Pastikan user dengan email berikut sudah ada di database:
--    - Pelapor: Dina, Rivan, Nisrina, dll (atau gunakan user dummy)
--    - Teknisi: Dastin, Alif Firdaus, Jalu, Muhamad Rizal, dll
-- 2. Priority mapping: P1=critical, P2=high, P3=medium, P4=low
-- 3. Status mapping: Closed=closed, In Progress=in_progress, On Escalation=escalation_to_vendor
-- 4. Tanggal format: DD/MM/YYYY HH:MM:SS → YYYY-MM-DD HH:MM:SS

-- Step 1: Create dummy users if not exist (optional, adjust as needed)
-- Uncomment jika perlu create dummy users

/*
-- Create dummy reporter
INSERT INTO public.users (id, email, full_name, role, availability_status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'reporter@kcic.co.id', 'Generic Reporter', 'employee', 'offline')
ON CONFLICT (email) DO NOTHING;

-- Create dummy technicians
INSERT INTO public.users (id, email, full_name, role, availability_status)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'dastin@kcic.co.id', 'Dastin', 'technician', 'offline'),
  ('22222222-2222-2222-2222-222222222223', 'alif.firdaus@kcic.co.id', 'Alif Firdaus', 'technician', 'offline'),
  ('22222222-2222-2222-2222-222222222224', 'jalu@kcic.co.id', 'Jalu', 'technician', 'offline'),
  ('22222222-2222-2222-2222-222222222225', 'rizal@kcic.co.id', 'Muhamad Rizal', 'technician', 'offline'),
  ('22222222-2222-2222-2222-222222222226', 'alif.ghifari@kcic.co.id', 'Alif Al Ghifari', 'technician', 'offline'),
  ('22222222-2222-2222-2222-222222222227', 'fatah@kcic.co.id', 'Fatah', 'technician', 'offline'),
  ('22222222-2222-2222-2222-222222222228', 'egi@kcic.co.id', 'Egi Yudhistira', 'technician', 'offline')
ON CONFLICT (email) DO NOTHING;
*/

-- Step 2: Insert ticket data
INSERT INTO public.tickets (
  custom_id,
  title,
  description,
  priority,
  status,
  station,
  equipment_category,
  created_by,
  assigned_to,
  created_at,
  first_response_at,
  resolved_at,
  sla_response_status,
  sla_solving_status
) VALUES

-- Ticket 1
('HPIO-INC-041225-001', 'TVM 401 tidak berfungsi (abnormal)', 'tidak berfungsi (abnormal)', 'medium', 'closed', 'Tegalluar', 'TVM 401', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-23 07:35:00', '2025-12-23 07:41:00', '2025-12-23 09:38:00', 'on_time', 'on_time'),

-- Ticket 2
('HPIO-INC-011225-002', 'Tiket tersangkut di loket 2', 'Tiket tersangkut di loket 2', 'high', 'closed', 'Halim', 'Loket 2', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-23 00:00:00', NULL, NULL, 'pending', 'pending'),

-- Ticket 3
('HPIO-INC-011225-003', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Halim', 'Stasiun Announcement', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-23 00:00:00', NULL, NULL, 'pending', 'pending'),

-- Ticket 4
('HPIO-INC-021225-004', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Karawang', 'Stasiun Announcement', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-23 00:00:00', NULL, NULL, 'pending', 'pending'),

-- Ticket 5
('HPIO-INC-031225-005', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Padalarang', 'Stasiun Announcement', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-23 00:00:00', NULL, NULL, 'pending', 'pending'),

-- Ticket 6
('HPIO-INC-041225-006', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Tegalluar', 'Stasiun Announcement', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-23 00:00:00', NULL, NULL, 'pending', 'pending'),

-- Ticket 7
('HPIO-INC-041225-007', 'Mesin tiket pintu keluar tidak scan QR', 'Terkendala tidak menyescan QR', 'critical', 'closed', 'Tegalluar', 'Mesin tiket pintu keluar No. 013', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-23 00:00:00', NULL, NULL, 'pending', 'pending'),

-- Ticket 8-29 (shortened for brevity, pattern follows similar structure)
('HPIO-INC-031225-008', 'Gate in 021 LCD error', 'Layar LCD error (kedip-kedip)', 'high', 'closed', 'Stasiun Padalarang', 'Gate in 021', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-24 00:00:00', NULL, NULL, 'pending', 'pending'),

('HPIO-INC-011225-009', 'TVM 105 dikembalikan ke setting awal', 'Sudah tidak dipakai, dikembalikan ke settingan awal', 'medium', 'closed', 'Halim', 'TVM 105', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-24 00:00:00', NULL, NULL, 'pending', 'pending'),

('HPIO-INC-011225-010', 'Gate out 059 restart by sistem', 'Gate out 059 di pintu kedatangan restart by sistem', 'critical', 'closed', 'Halim', 'Gate Out 059', 
 '11111111-1111-1111-1111-111111111111', NULL, 
 '2025-12-24 00:00:00', NULL, NULL, 'pending', 'pending'),

-- Recent tickets with technician assignment and full SLA tracking
('HPIO-INC-010126-001', 'TVM 104 Penangguhan tiket menyangkut', 'Penangguhan TVM 104 disebabkan tiket menyangkut', 'critical', 'closed', 'HALIM', 'TVM 104', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', -- Dastin
 '2026-01-01 10:34:00', '2026-01-01 10:35:00', '2026-01-01 10:50:00', 'on_time', 'on_time'),

('HPIO-INC-010126-002', 'TVM 105 Penangguhan dinamo lemah', 'Penangguhan TVM 104 disebabkan oleh dinamo lemah. Kemudian ditukar dengan dinamo TVM 101.', 'critical', 'closed', 'HALIM', 'TVM 105', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', -- Dastin
 '2026-01-01 11:40:00', '2026-01-01 11:43:00', '2026-01-01 12:38:00', 'on_time', 'on_time'),

('HPIO-REQ-010126-001', 'PDP Screen Menukar', 'Menukar PDP Screen FA4 ke area waiting hall yang PDP nya mati', 'medium', 'in_progress', 'HALIM', 'PDP Screen', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', -- Alif Firdaus
 '2026-01-01 00:00:00', NULL, NULL, 'pending', 'pending'),

('HPIO-INC-010126-003', 'PIDS Peron tidak menampilkan jadwal', 'PIDS Peron 5-6 timur Halim tidak menampilkan jadwal perjalanan', 'medium', 'closed', 'HALIM', 'PIDS', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', -- Alif Firdaus
 '2026-01-01 18:45:00', '2026-01-01 18:58:00', '2026-01-02 00:37:00', 'on_time', 'on_time'),

('HPIO-INC-010126-004', 'TVM 106 tidak bisa ke metode pembayaran', 'TVM 106 tidak bisa digunakan, tidak bisa ke metode pembayaran', 'critical', 'closed', 'HALIM', 'TVM 106', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', -- Alif Firdaus
 '2026-01-02 11:32:00', '2026-01-02 11:33:00', '2026-01-02 12:21:00', 'on_time', 'on_time'),

('HPIO-INC-010126-005', 'TVM 105 error printer nyangkut', 'TVM 105 error printer nyangkut di tengah, Roller Kotor', 'high', 'closed', 'HALIM', 'TVM 105', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222225', -- Muhamad Rizal
 '2026-01-02 15:29:00', '2026-01-02 15:29:00', '2026-01-02 15:29:00', 'on_time', 'on_time'),

('HPIO-INC-030126-006', 'CCTV Xray mati', 'CCTV x ray mati', 'high', 'closed', 'PADALARANG', 'CCTV Xray', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222226', -- Alif Al Ghifari
 '2026-01-02 17:52:00', '2026-01-02 17:53:00', '2026-01-02 17:58:00', 'on_time', 'on_time'),

('HPIO-INC-030126-007', 'TVM 303 penangguhan tiket tersangkut', 'TVM 303 mengalami penangguhan karena 4 tiket tersangkut di roller tvm', 'high', 'closed', 'PADALARANG', 'TVM 303', 
 '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222226', -- Alif Al Ghifari
 '2026-01-02 20:10:00', '2026-01-02 20:10:00', '2026-01-02 20:32:00', 'on_time', 'on_time');

-- Add more tickets as needed following the same pattern

-- Verify inserted data
SELECT 
  custom_id,
  title,
  status,
  priority,
  station,
  created_at,
  first_response_at,
  resolved_at
FROM public.tickets
WHERE custom_id LIKE 'HPIO-%'
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- NOTES:
-- ========================================
-- 1. Replace user IDs dengan ID actual dari database users
-- 2. Adjust priority mapping sesuai kebutuhan
-- 3. Untuk ticket dengan tanggal '30/12/1899', ini data error - skip atau adjust manually
-- 4. Response Time dan Solving Time akan auto-calculated di aplikasi
