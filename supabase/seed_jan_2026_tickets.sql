-- ========================================
-- JANUARY 2026 TICKETS - PART 2
-- ========================================
-- Tickets with technician assignments
-- Run this AFTER creating technician accounts and getting their IDs

-- Step 1: Get technician IDs first
-- SELECT id, full_name FROM users WHERE role = 'technician' ORDER BY full_name;

-- Step 2: Replace the subqueries below with actual technician assignments

INSERT INTO tickets (
    custom_id, title, description, status, priority, station, location, equipment_category,
    created_by, assigned_to, created_at, first_response_at, resolved_at, updated_at
) VALUES

-- HPIO-INC-010126-001 - Dastin
('HPIO-INC-010126-001',
 'TVM 104 tiket menyangkut',
 'Penangguhan TVM 104 di HALIM disebabkan tiket menyangkut',
 'closed', 'critical', 'Halim', 'TVM 104', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Dastin' AND role = 'technician' LIMIT 1),
 '2026-01-01 00:00:00', '2026-01-01 10:35:00', '2026-01-01 10:50:00', '2026-01-01 10:50:00'),

-- HPIO-INC-010126-002 - Dastin  
('HPIO-INC-010126-002',
 'TVM 105 dinamo lemah',
 'Penangguhan TVM 105 disebabkan oleh dinamo lemah. Ditukar dengan dinamo TVM 101',
 'closed', 'critical', 'Halim', 'TVM 105', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Dastin' AND role = 'technician' LIMIT 1),
 '2026-01-01 00:00:00', '2026-01-01 11:43:00', '2026-01-01 12:38:00', '2026-01-01 12:38:00'),

-- HPIO-REQ-010126-001 - Alif Firdaus & Jalu (assign to Alif Firdaus)
('HPIO-REQ-010126-001',
 'Menukar PDP Screen FA4',
 'Menukar PDP Screen FA4 ke area waiting hall yang PDP nya mati di HALIM',
 'in_progress', 'medium', 'Halim', 'PDP Screen FA4', 'Display System', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Firdaus' AND role = 'technician' LIMIT 1),
 '2026-01-01 00:00:00', NULL, NULL, '2026-01-01 00:00:00'),

-- HPIO-INC-010126-003 - Alif Firdaus & Jalu
('HPIO-INC-010126-003',
 'PIDS Peron 5-6 tidak tampil jadwal',
 'PIDS Peron 5-6 timur Halim tidak menampilkan jadwal perjalanan',
 'closed', 'medium', 'Halim', 'PIDS Peron 5-6', 'PIDS', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Firdaus' AND role = 'technician' LIMIT 1),
 '2026-01-01 00:00:00', '2026-01-01 18:58:00', '2026-01-02 00:37:00', '2026-01-02 00:37:00'),

-- HPIO-INC-010126-004 - Alif Firdaus
('HPIO-INC-010126-004',
 'TVM 106 tidak bisa ke metode pembayaran',
 'TVM 106 di HALIM tidak bisa digunakan, tidak bisa ke metode pembayaran',
 'closed', 'critical', 'Halim', 'TVM 106', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Firdaus' AND role = 'technician' LIMIT 1),
 '2026-01-02 00:00:00', '2026-01-02 11:33:00', '2026-01-02 12:21:00', '2026-01-02 12:21:00'),

-- HPIO-INC-010126-005 - Muhamad Rizal
('HPIO-INC-010126-005',
 'TVM 105 error printer nyangkut',
 'TVM 105 error printer nyangkut di tengah, Roller Kotor di HALIM',
 'closed', 'high', 'Halim', 'TVM 105', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Muh. Rizal' AND role = 'technician' LIMIT 1),
 '2026-01-02 00:00:00', '2026-01-02 15:29:00', '2026-01-02 15:29:00', '2026-01-02 15:29:00'),

-- HPIO-INC-030126-006 - Alif Al Ghifari
('HPIO-INC-030126-006',
 'CCTV x-ray mati',
 'CCTV x-ray di PADALARANG mati',
 'closed', 'high', 'Padalarang', 'CCTV Xray', 'CCTV', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Al Ghifari' AND role = 'technician' LIMIT 1),
 '2026-01-02 00:00:00', '2026-01-02 17:53:00', '2026-01-02 17:58:00', '2026-01-02 17:58:00'),

-- HPIO-INC-030126-007 - Alif Al Ghifari
('HPIO-INC-030126-007',
 'TVM 303 tiket tersangkut di roller',
 'TVM 303 mengalami penangguhan karena 4 tiket tersangkut di roller tvm',
 'closed', 'high', 'Padalarang', 'TVM 303', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Al Ghifari' AND role = 'technician' LIMIT 1),
 '2026-01-02 00:00:00', '2026-01-02 20:10:00', '2026-01-02 20:32:00', '2026-01-02 20:32:00'),

-- HPIO-INC-030126-008 - No technician
('HPIO-INC-030126-008',
 'TVM 303 tidak dapat digunakan',
 'TVM 303 di PADALARANG tidak dapat digunakan',
 'closed', 'high', 'Padalarang', 'TVM 303', 'TVM', NULL, NULL,
 '2026-01-02 00:00:00', '2026-01-02 20:43:00', NULL, '2026-01-02 20:43:00'),

-- HPIO-INC-030126-009 - Alif Al Ghifari
('HPIO-INC-030126-009',
 'PC monitor ada bagian tidak berfungsi',
 'Pada PC loket ada bagian di monitor yang tidak dapat ditekan/berfungsi di PADALARANG',
 'closed', 'medium', 'Padalarang', 'PC Loket', 'Computer System', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Al Ghifari' AND role = 'technician' LIMIT 1),
 '2026-01-03 00:00:00', '2026-01-03 08:02:00', '2026-01-03 08:44:00', '2026-01-03 08:44:00'),

-- HPIO-REQ-010126-002 - Dastin
('HPIO-REQ-010126-002',
 'TVM lt.2 sesuaikan tampilan',
 'TVM lt.2 halim diminta untuk disesuaikan tampilannya seperti TVM lain',
 'closed', 'high', 'Halim', 'TVM Lt.2', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Dastin' AND role = 'technician' LIMIT 1),
 '2026-01-03 00:00:00', '2026-01-03 08:21:00', '2026-01-03 08:30:00', '2026-01-03 08:30:00'),

-- HPIO-INC-030126-010 - Fatah
('HPIO-INC-030126-010',
 'Tiket sobek nyangkut di gate 017',
 'Terdapat tiket sobek yang nyangkut di gate 017 PADALARANG',
 'closed', 'high', 'Padalarang', 'Gate 017', 'Gate System', NULL,
 (SELECT id FROM users WHERE full_name = 'Fatah' AND role = 'technician' LIMIT 1),
 '2026-01-03 00:00:00', '2026-01-03 20:56:00', '2026-01-03 21:03:00', '2026-01-03 21:03:00'),

-- HPIC-INC-030126-001 - Fatah
('HPIC-INC-030126-001',
 'Printer foto copy tidak nyala',
 'Printer foto copy di PADALARANG tidak nyala',
 'closed', 'low', 'Padalarang', 'Printer', 'Printer', NULL,
 (SELECT id FROM users WHERE full_name = 'Fatah' AND role = 'technician' LIMIT 1),
 '2026-01-04 00:00:00', '2026-01-04 06:18:00', '2026-01-04 06:24:00', '2026-01-04 06:24:00'),

-- HPIO-REQ-010126-003 - Muhammad Rizal
('HPIO-REQ-010126-003',
 'TVM tidak menampilkan iklan',
 'TVM 101, 109-113 stasiun halim tidak menampilkan iklan',
 'closed', 'high', 'Halim', 'TVM 101,109-113', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Muh. Rizal' AND role = 'technician' LIMIT 1),
 '2026-01-04 00:00:00', '2026-01-04 07:40:00', '2026-01-04 08:17:00', '2026-01-04 08:17:00'),

-- HPIO-INC-030126-011 - Fatah
('HPIO-INC-030126-011',
 'CCTV Xray error mati mendadak',
 'CCTV Xray di PADALARANG sering error tiba-tiba mati mendadak',
 'closed', 'high', 'Padalarang', 'CCTV Xray', 'CCTV', NULL,
 (SELECT id FROM users WHERE full_name = 'Fatah' AND role = 'technician' LIMIT 1),
 '2026-01-04 00:00:00', '2026-01-04 08:39:00', '2026-01-04 09:52:00', '2026-01-04 09:52:00'),

-- HPIO-INC-030126-012 - Fatah
('HPIO-INC-030126-012',
 'TVM-303 koneksi terputus',
 'TVM-303 mengalami penangguhan, status di layar koneksi terputus di PADALARANG',
 'closed', 'high', 'Padalarang', 'TVM 303', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Fatah' AND role = 'technician' LIMIT 1),
 '2026-01-05 00:00:00', '2026-01-05 06:16:00', '2026-01-05 06:39:00', '2026-01-05 06:39:00'),

-- HPIO-INC-030126-013 - Fatah
('HPIO-INC-030126-013',
 'X-ray mati',
 'X-ray di PADALARANG mati',
 'closed', 'high', 'Padalarang', 'X-ray', 'X-Ray', NULL,
 (SELECT id FROM users WHERE full_name = 'Fatah' AND role = 'technician' LIMIT 1),
 '2026-01-05 00:00:00', '2026-01-05 06:22:00', '2026-01-05 07:09:00', '2026-01-05 07:09:00'),

-- HPIO-REQ-010126-004 - Jalu
('HPIO-REQ-010126-004',
 'TVM tidak menampilkan iklan',
 'TVM 109-113 di HALIM tidak menampilkan iklan',
 'closed', 'high', 'Halim', 'TVM 109-113', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Jalu' AND role = 'technician' LIMIT 1),
 '2026-01-05 00:00:00', '2026-01-05 06:35:00', '2026-01-05 06:58:00', '2026-01-05 06:58:00'),

-- HPIO-INC-040126-014 - Egi Yudhistira (Egi)
('HPIO-INC-040126-014',
 'TVM 403 status abnormal',
 'TVM 403 stasiun tegalluar status abnormal',
 'closed', 'high', 'Tegalluar', 'TVM 403', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Egi' AND role = 'technician' LIMIT 1),
 '2026-01-05 00:00:00', '2026-01-05 07:15:00', '2026-01-05 07:23:00', '2026-01-05 07:23:00'),

-- HPIO-INC-040126-015 - Egi Yudhistira
('HPIO-INC-040126-015',
 'TVM 403 tiket tidak keluar',
 'TVM 403: 3 tiket PNP tidak tercetak setelah pembelian, status terbayar, masuk manifes, tapi tidak keluar tiket fisik',
 'closed', 'high', 'Tegalluar', 'TVM 403', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Egi' AND role = 'technician' LIMIT 1),
 '2026-01-05 00:00:00', '2026-01-06 11:36:00', '2026-01-06 11:57:00', '2026-01-06 11:57:00'),

-- HPIO-INC-030126-016 - Fatah
('HPIO-INC-030126-016',
 'TVM 303 penangguhan berulang',
 'TVM 303 mengalami penangguhan berulang kali di PADALARANG',
 'closed', 'high', 'Padalarang', 'TVM 303', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Fatah' AND role = 'technician' LIMIT 1),
 '2026-01-06 00:00:00', '2026-01-06 08:28:00', '2026-01-06 08:32:00', '2026-01-06 08:32:00'),

-- HPIO-INC-010126-017 - Muhammad Rizal
('HPIO-INC-010126-017',
 'Printer tuslah kendala print lama',
 'Printer tuslah ada kendala saat print tiket keluarnya lama, barcode tidak terbaca di gate in',
 'closed', 'high', 'Halim', 'Printer Tuslah', 'Printer', NULL,
 (SELECT id FROM users WHERE full_name = 'Muh. Rizal' AND role = 'technician' LIMIT 1),
 '2026-01-06 00:00:00', '2026-01-06 09:21:00', '2026-01-06 12:58:00', '2026-01-06 12:58:00'),

-- HPIO-INC-030126-018 - Fatah
('HPIO-INC-030126-018',
 'Keyboard CCTV Xray mengetik sendiri',
 'Keyboard CCTV xray di PADALARANG mengalami gangguan mengetik sendiri',
 'closed', 'medium', 'Padalarang', 'Keyboard CCTV Xray', 'CCTV', NULL,
 (SELECT id FROM users WHERE full_name = 'Fatah' AND role = 'technician' LIMIT 1),
 '2026-01-06 00:00:00', '2026-01-06 09:30:00', '2026-01-06 09:38:00', '2026-01-06 09:38:00'),

-- HPIO-INC-010126-019 - Muhammad Rizal
('HPIO-INC-010126-019',
 'TVM 105 roll tiket habis',
 'TVM 105 stasiun halim mengalami penangguhan dikarenakan roll tiket habis',
 'closed', 'high', 'Halim', 'TVM 105', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Muh. Rizal' AND role = 'technician' LIMIT 1),
 '2026-01-06 00:00:00', '2026-01-06 18:49:00', '2026-01-06 19:12:00', '2026-01-06 19:12:00'),

-- HPIO-INC-010126-020 - PSAC (no technician in our list, leave NULL)
('HPIO-INC-010126-020',
 'TVM 104 gulungan habis',
 'TVM 104 di HALIM gulungan tiket habis',
 'closed', 'high', 'Halim', 'TVM 104', 'TVM', NULL, NULL,
 '2026-01-07 00:00:00', '2026-01-07 06:57:00', '2026-01-07 06:58:00', '2026-01-07 06:58:00'),

-- HPIO-REQ-010126-005 - Alif Firdaus
('HPIO-REQ-010126-005',
 'TVM 106 ditangguhkan setting iklan',
 'TVM 106 stasiun halim diminta untuk ditangguhkan sementara, setting menampilkan iklan',
 'closed', 'high', 'Halim', 'TVM 106', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Firdaus' AND role = 'technician' LIMIT 1),
 '2026-01-07 00:00:00', '2026-01-07 07:05:00', '2026-01-07 07:33:00', '2026-01-07 07:33:00'),

-- HPIO-INC-010126-021 - Alif Firdaus
('HPIO-INC-010126-021',
 'PC Tuslah kendala kirim manifest',
 'PC Tuslah di HALIM kendala dalam pengiriman manifest',
 'closed', 'high', 'Halim', 'PC Tuslah', 'Computer System', NULL,
 (SELECT id FROM users WHERE full_name = 'Alif Firdaus' AND role = 'technician' LIMIT 1),
 '2026-01-07 00:00:00', '2026-01-07 07:09:00', '2026-01-07 07:32:00', '2026-01-07 07:32:00'),

-- HPIO-INC-040126-022 - Dastin
('HPIO-INC-040126-022',
 'Gate in 004 tidak bisa scan barcode',
 'Mesin gate in lt 3 no.004 st.tegalluar tidak bisa scan barcode',
 'closed', 'critical', 'Tegalluar', 'Gate in 004', 'Gate System', NULL,
 (SELECT id FROM users WHERE full_name = 'Dastin' AND role = 'technician' LIMIT 1),
 '2026-01-07 00:00:00', '2026-01-07 09:03:00', '2026-01-07 09:07:00', '2026-01-07 09:07:00'),

-- HPIO-INC-040126-023 - Dastin
('HPIO-INC-040126-023',
 'Monitor X-Ray error tidak muncul barang',
 'Layar monitor X-Ray lt.2 mengalami error, tidak ada muncul barang pemeriksaan di layarnya',
 'closed', 'high', 'Tegalluar', 'Monitor X-Ray lt.2', 'X-Ray', NULL,
 (SELECT id FROM users WHERE full_name = 'Dastin' AND role = 'technician' LIMIT 1),
 '2026-01-07 00:00:00', '2026-01-07 12:59:00', '2026-01-07 13:11:00', '2026-01-07 13:11:00'),

-- HPIO-INC-040126-024 - No technician
('HPIO-INC-040126-024',
 'TVM 403 penangguhan',
 'TVM 403 st. tegalluar penangguhan',
 'closed', 'high', 'Tegalluar', 'TVM 403', 'TVM', NULL, NULL,
 '2026-01-07 00:00:00', '2026-01-07 16:36:00', '2026-01-07 16:46:00', '2026-01-07 16:46:00'),

-- HPIO-INC-040126-025 - Rizal Mutaqien
('HPIO-INC-040126-025',
 'TVM 403 tiket tersangkut berulang',
 'TVM 403 beberapa kali mengalami tiket tersangkut dan mengalami penangguhan kembali',
 'closed', 'high', 'Tegalluar', 'TVM 403', 'TVM', NULL,
 (SELECT id FROM users WHERE full_name = 'Rizal Mutaqien' AND role = 'technician' LIMIT 1),
 '2026-01-07 00:00:00', '2026-01-07 17:55:00', '2026-01-07 18:41:00', '2026-01-07 18:41:00'),

-- HPIO-INC-010126-026 - Jaro (not in our list, leave NULL)
('HPIO-INC-010126-026',
 'TVM 109 mengalami gangguan',
 'TVM 109 di HALIM mengalami gangguan',
 'closed', 'high', 'Halim', 'TVM 109', 'TVM', NULL, NULL,
 '2026-01-07 00:00:00', '2026-01-07 19:04:00', '2026-01-07 19:08:00', '2026-01-07 19:08:00'),

-- HPIO-INC-010126-027 - Jaro (not in our list, leave NULL)
('HPIO-INC-010126-027',
 'TVM 104 restart belum solved',
 'TVM 104 di HALIM sudah 2 kali restart masih belum bisa solved',
 'closed', 'high', 'Halim', 'TVM 104', 'TVM', NULL, NULL,
 '2026-01-08 00:00:00', '2026-01-07 08:16:00', '2026-01-07 08:39:00', '2026-01-07 08:39:00');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Count total tickets inserted
SELECT COUNT(*) as total_tickets FROM tickets;

-- Count by status
SELECT status, COUNT(*) as count 
FROM tickets 
GROUP BY status 
ORDER BY count DESC;

-- Count by station
SELECT station, COUNT(*) as count 
FROM tickets 
GROUP BY station 
ORDER BY count DESC;

-- Count by priority
SELECT priority, COUNT(*) as count 
FROM tickets 
GROUP BY priority 
ORDER BY count DESC;

-- Check tickets with technicians assigned
SELECT 
    t.custom_id,
    t.title,
    t.status,
    u.full_name as technician_name
FROM tickets t
LEFT JOIN users u ON t.assigned_to = u.id
WHERE t.custom_id LIKE 'HPIO-%'
ORDER BY t.created_at DESC
LIMIT 20;
