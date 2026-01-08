-- ========================================
-- SEED HISTORICAL TICKETS DATA
-- ========================================
-- Date: 2026-01-08
-- Source: Historical ticket data from December 2025 - January 2026
--
-- NOTES:
-- 1. created_by field set to NULL (manual input via web required)
-- 2. assigned_to akan di-mapping ke teknisi yang sudah ada
-- 3. Priority mapping: P1=critical, P2=high, P3=medium, P4=low
-- 4. Status mapping: Closed=closed, In Progress=in_progress, On Escalation=on_escalation
--
-- IMPORTANT: Run this AFTER creating user accounts (admin & technician users)
-- ========================================

-- Helper: Get technician IDs (uncomment and adjust after users are created)
-- You'll need to replace these with actual UUIDs from your users table
-- SELECT id, full_name, email FROM users WHERE role = 'technician';

-- ========================================
-- DECEMBER 2025 TICKETS
-- ========================================

INSERT INTO tickets (
    custom_id, 
    title, 
    description, 
    status, 
    priority, 
    station, 
    location,
    equipment_category,
    created_by,
    assigned_to,
    created_at,
    first_response_at,
    resolved_at,
    updated_at
) VALUES

-- HPIO-INC-041225-001
('HPIO-INC-041225-001', 
 'TVM tidak berfungsi (abnormal)', 
 'TVM di Stasiun Tegalluar tidak berfungsi (abnormal)',
 'closed', 
 'medium', 
 'Tegalluar', 
 'TVM',
 'TVM',
 NULL, -- created_by: Manual input required untuk "Anisa Amalia"
 NULL, -- assigned_to: No technician specified
 '2025-12-23 00:00:00'::timestamp,
 '2025-12-23 07:41:00'::timestamp,
 '2025-12-23 09:38:00'::timestamp,
 '2025-12-23 09:38:00'::timestamp),

-- HPIO-INC-011225-002
('HPIO-INC-011225-002',
 'Tiket tersangkut di loket 2',
 'Tiket tersangkut di loket 2 Stasiun Halim',
 'closed',
 'high',
 'Halim',
 'Loket 2',
 'Loket',
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp),

-- HPIO-INC-011225-003
('HPIO-INC-011225-003',
 'Stasiun announcement delay',
 'Stasiun announcement delay di Halim',
 'closed',
 'medium',
 'Halim',
 'Stasiun Announcement',
 'Announcement System',
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp),

-- HPIO-INC-021225-004
('HPIO-INC-021225-004',
 'Stasiun announcement delay',
 'Stasiun announcement delay di Karawang',
 'closed',
 'medium',
 'Karawang',
 'Stasiun Announcement',
 'Announcement System',
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp),

-- HPIO-INC-031225-005
('HPIO-INC-031225-005',
 'Stasiun announcement delay',
 'Stasiun announcement delay di Padalarang',
 'closed',
 'medium',
 'Padalarang',
 'Stasiun Announcement',
 'Announcement System',
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp),

-- HPIO-INC-041225-006
('HPIO-INC-041225-006',
 'Stasiun announcement delay',
 'Stasiun announcement delay di Tegalluar',
 'closed',
 'medium',
 'Tegalluar',
 'Stasiun Announcement',
 'Announcement System',
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp),

-- HPIO-INC-041225-007
('HPIO-INC-041225-007',
 'Mesin tiket pintu keluar tidak menyescan QR',
 'Mesin tiket pintu keluar No. 013 terkendala tidak menyescan QR di Tegalluar',
 'closed',
 'critical',
 'Tegalluar',
 'Mesin tiket pintu keluar No. 013',
 'Gate System',
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp),

-- HPIO-INC-031225-008
('HPIO-INC-031225-008',
 'Layar LCD error (kedip-kedip)',
 'Gate in 021 - Layar LCD error (kedip-kedip) di Stasiun Padalarang',
 'closed',
 'high',
 'Padalarang',
 'Gate in 021',
 'Gate System',
 NULL,
 NULL,
 '2025-12-24 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-24 00:00:00'::timestamp),

-- HPIO-INC-011225-009
('HPIO-INC-011225-009',
 'TVM sudah tidak dipakai, dikembalikan',
 'TVM di Halim sudah tidak dipakai, dikembalikan ke settingan awal',
 'closed',
 'medium',
 'Halim',
 'TVM',
 'TVM',
 NULL,
 NULL,
 '2025-12-24 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-24 00:00:00'::timestamp),

-- HPIO-INC-011225-010
('HPIO-INC-011225-010',
 'Gate out 059 restart by sistem',
 'Gate out 059 di pintu kedatangan Halim restart by sistem',
 'closed',
 'critical',
 'Halim',
 'Gate Out 059',
 'Gate System',
 NULL,
 NULL,
 '2025-12-24 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-24 00:00:00'::timestamp),

-- HPIO-INC-041225-011
('HPIO-INC-041225-011',
 'X-Ray mati secara tiba-tiba berulang kali',
 'X-Ray lt.2 area check barang di Tegalluar mati secara tiba-tiba berulang kali',
 'closed',
 'critical',
 'Tegalluar',
 'X-Ray lt.2',
 'X-Ray',
 NULL,
 NULL,
 '2025-12-25 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-25 00:00:00'::timestamp),

-- Continue with more tickets...
-- HPIO-INC-041225-012
('HPIO-INC-041225-012',
 'Tampilan TVM 401 abnormal',
 'TVM 401 di Tegalluar tampilan abnormal',
 'closed',
 'medium',
 'Tegalluar',
 'TVM 401',
 'TVM',
 NULL,
 NULL,
 '2025-12-25 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-25 00:00:00'::timestamp),

-- HPIO-INC-031225-013
('HPIO-INC-031225-013',
 'Komputer FWC bermasalah',
 'Komputer FWC di Padalarang bermasalah',
 'closed',
 'critical',
 'Padalarang',
 'Komputer FWC',
 'FWC Computer',
 NULL,
 NULL,
 '2025-12-25 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-25 00:00:00'::timestamp),

-- HPIO-INC-041225-014
('HPIO-INC-041225-014',
 'PIDS peron 3 & 4 glitch',
 'PIDS peron 3 & 4 timur stasiun Tegalluar glitch',
 'closed',
 'medium',
 'Tegalluar',
 'PIDS Peron 3 & 4',
 'PIDS',
 NULL,
 NULL,
 '2025-12-26 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-26 00:00:00'::timestamp),

-- HPIO-INC-021225-015
('HPIO-INC-021225-015',
 'LCD tidak menyala',
 'LCD di Karawang tidak menyala',
 'closed',
 'medium',
 'Karawang',
 'LCD',
 'Display System',
 NULL,
 NULL,
 '2025-12-27 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-27 00:00:00'::timestamp),

-- HPIO-INC-011225-016
('HPIO-INC-011225-016',
 'TVM 105 ngelag tidak bisa pencet layar',
 'TVM 105 di Halim ngelag tidak bisa pencet layar',
 'closed',
 'critical',
 'Halim',
 'TVM 105',
 'TVM',
 NULL,
 NULL,
 '2025-12-27 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-27 00:00:00'::timestamp),

-- HPIO-INC-011225-017
('HPIO-INC-011225-017',
 'Gulungan Tiket Habis',
 'TVM di Halim gulungan tiket habis pada 12:50:47',
 'closed',
 'high',
 'Halim',
 'TVM',
 'TVM',
 NULL,
 NULL,
 '2025-12-27 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-27 00:00:00'::timestamp),

-- HPIO-INC-011225-018
('HPIO-INC-011225-018',
 'Kabel PC ke laptop tidak konek',
 'Kabel yang nyambung dari PC ke laptop tidak bisa konek untuk kirim manifest di Halim',
 'closed',
 'medium',
 'Halim',
 'PC',
 'Computer System',
 NULL,
 NULL,
 '2025-12-28 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-28 00:00:00'::timestamp),

-- HPIO-INC-031225-019
('HPIO-INC-031225-019',
 'Case check in - timing issue',
 'Gate in 17: sistem waktu checkin di jam 13:19 close gate, tapi gate masih bisa checkin di jam 13:21',
 'in_progress',
 'medium',
 'Padalarang',
'Gate in 17',
 'Gate System',
 NULL,
 NULL,
 '2025-12-28 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-28 00:00:00'::timestamp),

-- HPIO-INC-011225-020
('HPIO-INC-011225-020',
 'PC Terkendala',
 'PC di HALIM terkendala',
 'closed',
 'medium',
 'Halim',
 'PC',
 'Computer System',
 NULL,
 NULL,
 '2025-12-29 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-29 00:00:00'::timestamp),

-- HPIO-INC-011225-021
('HPIO-INC-011225-021',
 'Bigscreen mati',
 'Bigscreen di HALIM nambah 1 yang mati',
 'in_progress',
 'critical',
 'Halim',
 'Bigscreen',
 'Display System',
 NULL,
 NULL,
 '2025-12-29 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-29 00:00:00'::timestamp),

-- HPIO-INC-031225-022
('HPIO-INC-031225-022',
 'Loket FWC mengalami gangguan',
 'Loket FWC di PADALARANG mengalami gangguan',
 'closed',
 'critical',
 'Padalarang',
 'FWC',
 'FWC System',
 NULL,
 NULL,
 '2025-12-29 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-29 00:00:00'::timestamp),

-- HPIO-INC-041225-023
('HPIO-INC-041225-023',
 'TVM 403 Penangguhan',
 'TVM 403 di TEGALLUAR SUMMARECON penangguhan',
 'closed',
 'critical',
 'Tegalluar',
 'TVM 403',
 'TVM',
 NULL,
 NULL,
 '2025-12-30 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-30 00:00:00'::timestamp),

-- HPIO-INC-011225-024
('HPIO-INC-011225-024',
 'Printer loket 4 tidak ada tulisan',
 'Printer loket 4 st halim pada saat print tiket tidak ada tulisannya',
 'closed',
 'critical',
 'Halim',
 'Printer Loket 4',
 'Printer',
 NULL,
 NULL,
 '2025-12-30 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-30 00:00:00'::timestamp),

-- HPIO-INC-031225-025
('HPIO-INC-031225-025',
 'Kondisi Pintu FA lepas',
 'Kondisi Pintu FA lepas di PADALARANG',
 'closed',
 'medium',
 'Padalarang',
 'Pintu FA',
 'Door System',
 NULL,
 NULL,
 '2025-12-30 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-30 00:00:00'::timestamp),

-- HPIO-INC-041225-026
('HPIO-INC-041225-026',
 'Xray lt.2 tidak mau maju',
 'X-ray lt.2 di TEGALLUAR tidak mau maju atau bergerak',
 'closed',
 'critical',
 'Tegalluar',
 'X-ray lt.2',
 'X-Ray',
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-23 00:00:00'::timestamp),

-- HPIO-INC-011225-027
('HPIO-INC-011225-027',
 'LCD area TVM berkedip dan gelap',
 'LCD di area TVM lantai 1 stasiun Halim layarnya berkedip dan agak sedikit gelap',
 'on_escalation',
 'medium',
 'Halim',
 'LCD TVM Lt.1',
 'Display System',
 NULL,
 NULL,
 '2025-12-26 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-26 00:00:00'::timestamp),

-- HPIO-INC-011225-028
('HPIO-INC-011225-028',
 'Laptop Tuslah tidak bisa baca data',
 'Laptop Tuslah di HALIM tidak bisa kebaca data dari PC, jadi tidak bisa kirim manifest',
 'closed',
 'high',
 'Halim',
 'Laptop Tuslah',
 'Computer System',
 NULL,
 NULL,
 '2025-12-31 00:00:00'::timestamp,
 NULL,
 NULL,
 '2025-12-31 00:00:00'::timestamp);

-- ========================================
-- JANUARY 2026 TICKETS (WITH TECHNICIAN ASSIGNMENT)
-- ========================================
-- Note: You need to get actual user IDs for technicians
-- Run this query first to get technician IDs:
-- SELECT id, full_name FROM users WHERE role = 'technician' ORDER BY full_name;

-- After getting technician IDs, use this template to insert tickets with assigned technicians:
-- Replace {{TECHNICIAN_ID}} with actual UUID from users table

-- Example for tickets with known technicians:
/*
INSERT INTO tickets (custom_id, title, description, status, priority, station, location, equipment_category, 
                     created_by, assigned_to, created_at, first_response_at, resolved_at, updated_at)
VALUES
-- HPIO-INC-010126-001 - Assigned to Dastin
('HPIO-INC-010126-001',
 'TVM 104 tiket menyangkut',
 'Penangguhan TVM 104 di HALIM disebabkan tiket menyangkut',
 'closed',
 'critical',
 'Halim',
 'TVM 104',
 'TVM',
 NULL,
 (SELECT id FROM users WHERE full_name = 'Dastin' AND role = 'technician' LIMIT 1),
 '2026-01-01 00:00:00'::timestamp,
 '2026-01-01 10:35:00'::timestamp,
 '2026-01-01 10:50:00'::timestamp,
 '2026-01-01 10:50:00'::timestamp),

-- Continue with other January tickets...
*/

-- ========================================
-- INSTRUCTIONS FOR COMPLETING THE INSERT
-- ========================================
-- 1. First, create all user accounts (admin & technicians)
-- 2. Run: SELECT id, full_name FROM users WHERE role = 'technician';
-- 3. Replace {{TECHNICIAN_ID}} in the template above with actual UUIDs
-- 4. For created_by field, either:
--    - Leave as NULL and update manually via web
--    - Or map to actual admin user IDs after creating admin accounts
-- 5. Verify data before running: SELECT COUNT(*) FROM tickets;
