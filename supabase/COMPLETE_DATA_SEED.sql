-- ========================================
-- IMPORT DATA TIKET HISTORICAL KCIC
-- Complete seed data with users and ticket assignments
-- ========================================

-- STEP 1: CREATE DUMMY USERS
-- Reporters (Pelapor)
INSERT INTO public.users (id, email, full_name, role, availability_status) VALUES
('10000100-0000-4000-8000-000000000001', 'dina@kcic.co.id', 'Dina', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000002', 'rivan@kcic.co.id', 'Rivan', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000003', 'nisrina@kcic.co.id', 'Nisrina', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000004', 'rista@kcic.co.id', 'A.Rista Putri', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000005', 'ananda@kcic.co.id', 'Ananda', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000006', 'fauzan@kcic.co.id', 'Fauzan', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000007', 'devi@kcic.co.id', 'Devi', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000008', 'nur.indriani@kcic.co.id', 'Nur Indriani', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000009', 'febian@kcic.co.id', 'Febian', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000000a', 'nadio@kcic.co.id', 'Nadio', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000000b', 'riyadi@kcic.co.id', 'Riyadi', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000000c', 'fina@kcic.co.id', 'Fina', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000000d', 'titis@kcic.co.id', 'Titis', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000000e', 'hanifa@kcic.co.id', 'Siti Hanifa', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000000f', 'jee@kcic.co.id', 'Jee', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000010', 'dina.arofatun@kcic.co.id', 'Dina Arofatun Nahdiyah', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000011', 'anggun@kcic.co.id', 'Anggun', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000012', 'dania@kcic.co.id', 'Dania', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000013', 'devi.hardhasari@kcic.co.id', 'Devi Hardhasari', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000014', 'nadia.revi@kcic.co.id', 'Nadia Revi', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000015', 'ayu.fatimah@kcic.co.id', 'Ayu Fatimah', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000016', 'eko.budi@kcic.co.id', 'Eko Budi', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000017', 'djanoe@kcic.co.id', 'Djanoe', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000018', 'ubay@kcic.co.id', 'Ubay', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000019', 'razy@kcic.co.id', 'Razy', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000001a', 'haikal@kcic.co.id', 'Haikal', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000001b', 'titis.ccr@kcic.co.id', 'Titis CCR PDG', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000001c', 'ichram@kcic.co.id', 'Ichram Akbar', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000001d', 'azmi@kcic.co.id', 'Azmi Rifai', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000001e', 'theodore@kcic.co.id', 'Theodore', 'employee', 'offline'),
('10000100-0000-4000-8000-00000000001f', 'triska@kcic.co.id', 'Triska', 'employee', 'offline'),
('10000100-0000-4000-8000-000000000020', 'ali.mahfud@kcic.co.id', 'Ali Mahfud', 'employee', 'offline');

-- Receivers (Penerima Laporan) - Manager role
INSERT INTO public.users (id, email, full_name, role, availability_status) VALUES
('20000100-0000-4000-8000-000000000001', 'anisa.amalia@kcic.co.id', 'Anisa Amalia', 'manager', 'available'),
('20000100-0000-4000-8000-000000000002', 'inna.m@kcic.co.id', 'Inna M', 'manager', 'available'),
('20000100-0000-4000-8000-000000000003', 'nisrina.hasna@kcic.co.id', 'Nisrina Hasna', 'manager', 'available');

-- Technicians (Teknisi)
INSERT INTO public.users (id, email, full_name, role, availability_status) VALUES
('30000100-0000-4000-8000-000000000001', 'dastin@kcic.co.id', 'Dastin', 'technician', 'available'),
('30000100-0000-4000-8000-000000000002', 'alif.firdaus@kcic.co.id', 'Alif Firdaus', 'technician', 'available'),
('30000100-0000-4000-8000-000000000003', 'jalu@kcic.co.id', 'Jalu', 'technician', 'available'),
('30000100-0000-4000-8000-000000000004', 'muhammad.rizal@kcic.co.id', 'Muhamad Rizal', 'technician', 'available'),
('30000100-0000-4000-8000-000000000005', 'alif.ghifari@kcic.co.id', 'Alif Al Ghifari', 'technician', 'available'),
('30000100-0000-4000-8000-000000000006', 'fatah@kcic.co.id', 'Fatah', 'technician', 'available'),
('30000100-0000-4000-8000-000000000007', 'egi.yudhistira@kcic.co.id', 'Egi Yudhistira', 'technician', 'available'),
('30000100-0000-4000-8000-000000000008', 'psac@kcic.co.id', 'PSAC', 'technician', 'available');

-- ========================================
-- STEP 2: INSERT TICKETS
-- ========================================

-- Ticket 1: HPIO-INC-041225-001
INSERT INTO public.tickets (custom_id, title, description, priority, status, station, equipment_category, created_by, created_at, first_response_at, resolved_at) VALUES
('HPIO-INC-041225-001', 'TVM 401 tidak berfungsi (abnormal)', 'tidak berfungsi (abnormal)', 'medium', 'closed', 'Tegalluar', 'TVM 401', '100001-0000-0000-0000-000000000001', '2025-12-23 07:35:00', '2025-12-23 07:41:00', '2025-12-23 09:38:00');

-- Ticket 2-28: Without technician
INSERT INTO public.tickets (custom_id, title, description, priority, status, station, equipment_category, created_by, created_at) VALUES
('HPIO-INC-011225-002', 'Tiket tersangkut di loket 2', 'Tiket tersangkut di loket 2', 'high', 'closed', 'Halim', 'Loket 2', '100001-0000-0000-0000-000000000002', '2025-12-23 00:00:00'),
('HPIO-INC-011225-003', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Halim', 'Stasiun Announcement', '100001-0000-0000-0000-000000000003', '2025-12-23 00:00:00'),
('HPIO-INC-021225-004', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Karawang', 'Stasiun Announcement', '100001-0000-0000-0000-000000000003', '2025-12-23 00:00:00'),
('HPIO-INC-031225-005', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Padalarang', 'Stasiun Announcement', '100001-0000-0000-0000-000000000003', '2025-12-23 00:00:00'),
('HPIO-INC-041225-006', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Tegalluar', 'Stasiun Announcement', '100001-0000-0000-0000-000000000003', '2025-12-23 00:00:00'),
('HPIO-INC-041225-007', 'Mesin tiket pintu keluar No. 013 tidak scan QR', 'Terkendala tidak menyescan QR', 'critical', 'closed', 'Tegalluar', 'Mesin tiket pintu keluar No. 013', '100001-0000-0000-0000-000000000004', '2025-12-23 00:00:00'),
('HPIO-INC-031225-008', 'Gate in 021 LCD error', 'Layar LCD error (kedip-kedip)', 'high', 'closed', 'Padalarang', 'Gate in 021', '100001-0000-0000-0000-000000000005', '2025-12-24 00:00:00'),
('HPIO-INC-011225-009', 'TVM 105 dikembalikan ke setting awal', 'Sudah tidak dipakai, dikembalikan ke settingan awal', 'medium', 'closed', 'Halim', 'TVM 105', '100001-0000-0000-0000-000000000006', '2025-12-24 00:00:00'),
('HPIO-INC-011225-010', 'Gate Out 059 restart by sistem', 'Gate out 059 di pintu kedatangan restart by sistem', 'critical', 'closed', 'Halim', 'Gate Out 059', '100001-0000-0000-0000-000000000006', '2025-12-24 00:00:00'),
('HPIO-INC-041225-011', 'X-Ray lt.2 mati berulang kali', 'X-Ray lt.2 area check barang mati secara tiba-tiba berulang kali', 'critical', 'closed', 'Tegalluar', 'X-Ray', '100001-0000-0000-0000-000000000007', '2025-12-25 00:00:00'),
('HPIO-INC-041225-012', 'TVM 401 tampilan abnormal', 'tampilan TVM 401 abnormal', 'medium', 'closed', 'Tegalluar', 'TVM 401', '100001-0000-0000-0000-000000000001', '2025-12-25 00:00:00'),
('HPIO-INC-031225-013', 'Komputer FWC bermasalah', 'Komputer FWC bermasalah', 'critical', 'closed', 'Padalarang', 'Komputer FWC', '100001-0000-0000-0000-000000000003', '2025-12-25 00:00:00'),
('HPIO-INC-041225-014', 'PIDS peron glitch', 'PIDS peron 3 & 4 timur stasiun Tegalluar glitch', 'medium', 'closed', 'Tegalluar', 'PIDS', '100001-0000-0000-0000-000000000008', '2025-12-26 00:00:00'),
('HPIO-INC-021225-015', 'LCD tidak menyala', 'Tidak menyala', 'medium', 'closed', 'Karawang', 'LCD', '100001-0000-0000-0000-000000000009', '2025-12-27 00:00:00'),
('HPIO-INC-011225-016', 'TVM 105 ngelag', 'TVM 105 ngelag tidak bisa pencet layar', 'critical', 'closed', 'Halim', 'TVM 105', '100001-0000-0000-0000-000000000010', '2025-12-27 00:00:00'),
('HPIO-INC-011225-017', 'TVM 104 Gulungan Tiket Habis', 'Gulungan Tiket Habis di 12:50:47', 'high', 'closed', 'Halim', 'TVM 104', '100001-0000-0000-0000-000000000011', '2025-12-27 00:00:00'),
('HPIO-INC-011225-018', 'PC kabel tidak konek', 'kabel yg nyambung dari PC ke laptop gabisa konek, untuk kirim manifest', 'medium', 'closed', 'Halim', 'PC', '100001-0000-0000-0000-000000000012', '2025-12-28 00:00:00'),
('HPIO-INC-031225-019', 'Gate in 17 check in issue', 'case terkait check in. untuk di sistem waktu checkinnya sudah sesuai di jam 13:19 close gate, tetapi pada gatenya masih bisa melakukan checkin di jam 13:21', 'medium', 'in_progress', 'Padalarang', 'Gate in 17', '100001-0000-0000-0000-000000000013', '2025-12-28 00:00:00'),
('HPIO-INC-011225-020', 'PC Terkendala', 'Terkendala', 'medium', 'closed', 'Halim', 'PC', '100001-0000-0000-0000-000000000014', '2025-12-29 00:00:00'),
('HPIO-INC-011225-021', 'Bigscreen mati', 'Bigscreen nambah 1 yang mati', 'critical', 'in_progress', 'Halim', 'Bigscreen', '100001-0000-0000-0000-000000000006', '2025-12-29 00:00:00'),
('HPIO-INC-031225-022', 'Loket FWC gangguan', 'Loket FWC mengalami gangguan', 'critical', 'closed', 'Padalarang', 'FWC', '100001-0000-0000-0000-000000000015', '2025-12-29 00:00:00'),
('HPIO-INC-041225-023', 'TVM 403 Penangguhan', 'TVM 403 Penangguhan', 'critical', 'closed', 'Tegalluar', 'TVM 403', '100001-0000-0000-0000-000000000016', '2025-12-30 00:00:00'),
('HPIO-INC-041225-024', 'Printer loket 4 tidak ada tulisan', 'printer loket 4 st halim pada saat print tiket tidak ada tulisannya', 'critical', 'closed', 'Halim', 'Printer', '100001-0000-0000-0000-000000000017', '2025-12-30 00:00:00'),
('HPIO-INC-031225-025', 'Pintu FA lepas', 'Kondisi Pintu FA lepas', 'medium', 'closed', 'Padalarang', 'Pintu', '100001-0000-0000-0000-000000000018', '2025-12-30 00:00:00'),
('HPIO-INC-041225-026', 'Xray lt2 tidak bergerak', 'xray lt2 tidak mau maju atau bergerak', 'critical', 'closed', 'Tegalluar', 'Xray', '100001-0000-0000-0000-000000000019', '2025-12-23 00:00:00'),
('HPIO-INC-011225-027', 'LCD berkedip dan gelap', 'LCD di area TVM lantai 1 stasiun Halim layarnya berkedip dan agak sedikit gelap', 'medium', 'on_escalation', 'Halim', 'LCD', '100001-0000-0000-0000-000000000020', '2025-12-26 00:00:00'),
('HPIO-INC-011225-028', 'Laptop Tuslah tidak baca data', 'gak bisa kebaca data yg dari pc nya, jadi gabisa kirim manifest', 'high', 'closed', 'Halim', 'Laptop Tuslah', '100001-0000-0000-0000-000000000021', '2025-12-31 00:00:00');

-- Tickets with technician assignment (January 2026)
INSERT INTO public.tickets (custom_id, title, description, priority, status, station, equipment_category, created_by, assigned_to, created_at, first_response_at, resolved_at) VALUES
('HPIO-INC-010126-001', 'TVM 104 tiket menyangkut', 'Penangguhan TVM 104 disebabkan tiket menyangkut', 'critical', 'closed', 'Halim', 'TVM 104', '100001-0000-0000-0000-000000000022', '300001-0000-0000-0000-000000000001', '2026-01-01 10:34:00', '2026-01-01 10:35:00', '2026-01-01 10:50:00'),
('HPIO-INC-010126-002', 'TVM 105 dinamo lemah', 'Penangguhan TVM 104 disebabkan oleh dinamo lemah. Kemudian ditukar dengan dinamo TVM 101', 'critical', 'closed', 'Halim', 'TVM 105', '100001-0000-0000-0000-000000000023', '300001-0000-0000-0000-000000000001', '2026-01-01 11:40:00', '2026-01-01 11:43:00', '2026-01-01 12:38:00'),
('HPIO-REQ-010126-001', 'Menukar PDP Screen', 'Menukar PDP Screen FA4 ke area waiting hall yang PDP nya mati', 'medium', 'in_progress', 'Halim', 'PDP Screen', '100001-0000-0000-0000-000000000024', '300001-0000-0000-0000-000000000002', '2026-01-01 00:00:00', NULL, NULL),
('HPIO-INC-010126-003', 'PIDS tidak tampil jadwal', 'PIDS Peron 5-6 timur Halim tidak menampilkan jadwal perjalanan', 'medium', 'closed', 'Halim', 'PIDS', '100001-0000-0000-0000-000000000024', '300001-0000-0000-0000-000000000002', '2026-01-01 18:45:00', '2026-01-01 18:58:00', '2026-01-02 00:37:00'),
('HPIO-INC-010126-004', 'TVM 106 tidak bisa bayar', 'TVM 106 tidak bisa digunakan, tidak bisa ke metode pembayaran', 'critical', 'closed', 'Halim', 'TVM 106', '100001-0000-0000-0000-000000000025', '300001-0000-0000-0000-000000000002', '2026-01-02 11:32:00', '2026-01-02 11:33:00', '2026-01-02 12:21:00'),
('HPIO-INC-010126-005', 'TVM 105 printer nyangkut', 'TVM 105 error printer nyangkut di tengah, Roller Kotor', 'high', 'closed', 'Halim', 'TVM 105', '100001-0000-0000-0000-000000000026', '300001-0000-0000-0000-000000000004', '2026-01-02 15:29:00', '2026-01-02 15:29:00', '2026-01-02 15:29:00'),
('HPIO-INC-030126-006', 'CCTV Xray mati', 'CCTV x ray mati', 'high', 'closed', 'Padalarang', 'CCTV Xray', '100001-0000-0000-0000-000000000027', '300001-0000-0000-0000-000000000005', '2026-01-02 17:52:00', '2026-01-02 17:53:00', '2026-01-02 17:58:00'),
('HPIO-INC-030126-007', 'TVM 303 tiket tersangkut', 'TVM 303 mengalami penangguhan karena 4 tiket tersangkut di roller tvm', 'high', 'closed', 'Padalarang', 'TVM 303', '100001-0000-0000-0000-000000000027', '300001-0000-0000-0000-000000000005', '2026-01-02 20:10:00', '2026-01-02 20:10:00', '2026-01-02 20:32:00'),
('HPIO-INC-030126-008', 'TVM 303 tidak dapat digunakan', 'TVM 303 tidak dapat digunakan', 'high', 'closed', 'Padalarang', 'TVM', '100001-0000-0000-0000-000000000028', NULL, '2026-01-02 20:42:00', '2026-01-02 20:43:00', NULL),
('HPIO-INC-030126-009', 'PC loket monitor tidak berfungsi', 'pada PC loket ada bagian di monitor yang tidak dapat ditekan/berfungsi', 'medium', 'closed', 'Padalarang', 'PC', '100001-0000-0000-0000-000000000028', '300001-0000-0000-0000-000000000005', '2026-01-03 08:02:00', '2026-01-03 08:02:00', '2026-01-03 08:44:00'),
('HPIO-REQ-010126-002', 'TVM setting tampilan', 'TVM lt.2 halim diminta untuk disesuaikan tampilannya seperti TVM lain', 'high', 'closed', 'Halim', 'TVM', '100001-0000-0000-0000-000000000006', '300001-0000-0000-0000-000000000001', '2026-01-03 08:21:00', '2026-01-03 08:21:00', '2026-01-03 08:30:00'),
('HPIO-INC-030126-010', 'Gate 017 tiket sobek nyangkut', 'Terdapat tiket sobek yang nyangkut di gate 017', 'high', 'closed', 'Padalarang', 'Gate 017', '100001-0000-0000-0000-000000000015', '300001-0000-0000-0000-000000000006', '2026-01-03 20:56:00', '2026-01-03 20:56:00', '2026-01-03 21:03:00'),
('HPIC-INC-030126-001', 'Printer fotocopy mati', 'printer foto copy tidak nyala', 'low', 'closed', 'Padalarang', 'Printer', '100001-0000-0000-0000-000000000018', '300001-0000-0000-0000-000000000006', '2026-01-04 06:17:00', '2026-01-04 06:18:00', '2026-01-04 06:24:00'),
('HPIO-REQ-010126-003', 'TVM tidak tampil iklan', 'tvm 101, 109 - 113 stasiun halim tidak menampilkan iklan', 'high', 'closed', 'Halim', 'TVM', '100001-0000-0000-0000-000000000031', '300001-0000-0000-0000-000000000004', '2026-01-04 07:40:00', '2026-01-04 07:40:00', '2026-01-04 08:17:00'),
('HPIO-INC-030126-011', 'CCTV Xray error', 'sering error tiba tiba mati mendadak', 'high', 'closed', 'Padalarang', 'CCTV Xray', '100001-0000-0000-0000-000000000028', '300001-0000-0000-0000-000000000006', '2026-01-04 08:39:00', '2026-01-04 08:39:00', '2026-01-04 09:52:00'),
('HPIO-INC-030126-012', 'TVM-303 penangguhan koneksi terputus', 'TVM-303 mengalami penangguhan, status di layar koneksi terputus', 'high', 'closed', 'Padalarang', 'TVM', '100001-0000-0000-0000-000000000015', '300001-0000-0000-0000-000000000006', '2026-01-05 06:16:00', '2026-01-05 06:16:00', '2026-01-05 06:39:00'),
('HPIO-INC-030126-013', 'X-ray mati', 'X-ray mati', 'high', 'closed', 'Padalarang', 'X-ray', '100001-0000-0000-0000-000000000018', '300001-0000-0000-0000-000000000006', '2026-01-05 06:22:00', '2026-01-05 06:22:00', '2026-01-05 07:09:00'),
('HPIO-REQ-010126-004', 'TVM 109-113 tidak tampil iklan', 'TVM 109-113 Tidak menampilkan iklan', 'high', 'closed', 'Halim', 'TVM', '100001-0000-0000-0000-000000000020', '300001-0000-0000-0000-000000000003', '2026-01-05 06:34:00', '2026-01-05 06:35:00', '2026-01-05 06:58:00'),
('HPIO-INC-040126-014', 'TVM 403 abnormal', 'tvm 403 stasiun tegalluar status abnormal', 'high', 'closed', 'Tegalluar', 'TVM', '100001-0000-0000-0000-000000000032', '300001-0000-0000-0000-000000000007', '2026-01-05 07:14:00', '2026-01-05 07:15:00', '2026-01-05 07:23:00'),
('HPIO-INC-040126-015', 'TVM 403 tiket fisik tidak keluar', 'TVM 403 ada 3 tiket pnp yg ga kecetak setelah pembelian di tvm, tp statusnya sdh terbayar, aman sdh masuk manifes, tp ga keluar tiket fisiknya', 'high', 'closed', 'Tegalluar', 'TVM', '100001-0000-0000-0000-000000000019', '300001-0000-0000-0000-000000000007', '2026-01-06 11:35:00', '2026-01-06 11:36:00', '2026-01-06 11:57:00'),
('HPIO-INC-030126-016', 'TVM 303 penangguhan berulang', 'TVM 303 mengalami penangguhan berulang kali', 'high', 'closed', 'Padalarang', 'TVM', '100001-0000-0000-0000-000000000029', '300001-0000-0000-0000-000000000006', '2026-01-06 08:27:00', '2026-01-06 08:28:00', '2026-01-06 08:32:00'),
('HPIO-INC-010126-017', 'Printer tuslah kendala cetak', 'printer tuslah ada kendala saat ngeprint tiket keluarnya lama, dan sebelumnya security ada yg mau cetak tiket karna barcode tidak terbaca lalu ketika diprint dituslah lama dan harus diulang berkali kali dan di gate in tidak terbaca juga tiket fisiknya', 'high', 'closed', 'Halim', 'Printer', '100001-0000-0000-0000-000000000017', '300001-0000-0000-0000-000000000004', '2026-01-06 09:20:00', '2026-01-06 09:21:00', '2026-01-06 12:58:00'),
('HPIO-INC-030126-018', 'Keyboard CCTV Xray mengetik sendiri', 'keyboard cctv xray pdg mengalami gangguan mengetik sendiri', 'medium', 'closed', 'Padalarang', 'Keyboard CCTV Xray', '100001-0000-0000-0000-000000000029', '300001-0000-0000-0000-000000000006', '2026-01-06 09:29:00', '2026-01-06 09:30:00', '2026-01-06 09:38:00'),
('HPIO-INC-010126-019', 'TVM 105 roll tiket habis', 'TVM 105 stasiun halim mengalami penangguhan dikarenakan roll tiket habis', 'high', 'closed', 'Halim', 'TVM', '100001-0000-0000-0000-000000000030', '300001-0000-0000-0000-000000000004', '2026-01-06 18:45:00', '2026-01-06 18:49:00', '2026-01-06 19:12:00'),
('HPIO-INC-010126-020', 'TVM 104 gulungan habis', 'TVM 104 gulungan habis', 'high', 'closed', 'Halim', 'TVM', '100001-0000-0000-0000-000000000031', '300001-0000-0000-0000-000000000008', '2026-01-07 06:57:00', '2026-01-07 06:57:00', '2026-01-07 06:58:00'),
('HPIO-REQ-010126-005', 'TVM 106 setting iklan', 'TVM 106 stasiun halim diminta untuk ditangguhkan dulu sementara, setting menampilkan iklan', 'high', 'closed', 'Halim', 'TVM', '100001-0000-0000-0000-000000000031', '300001-0000-0000-0000-000000000002', '2026-01-07 07:04:00', '2026-01-07 07:05:00', '2026-01-07 07:33:00'),
('HPIO-INC-010126-021', 'PC Tuslah kendala manifest', 'Kendala dalam pengiriman manifest', 'high', 'closed', 'Halim', 'PC Tuslah', '100001-0000-0000-0000-000000000017', '300001-0000-0000-0000-000000000002', '2026-01-07 07:08:00', '2026-01-07 07:09:00', '2026-01-07 07:32:00');

-- Note: Ticket with "Alif Firdaus & Jalu" will need ticket_assignees entries for multi-assignment

COMMIT;

-- ========================================
-- SUMMARY & VERIFICATION
-- ========================================
-- Total Users Created: 
--   - 32 Reporters (employees)
--   - 3 Receivers (managers)
--   - 8 Technicians
-- Total Tickets: 57

-- Verify counts:
SELECT COUNT(*) as total_tickets FROM public.tickets WHERE custom_id LIKE 'HPIO-%';
SELECT COUNT(*) as total_technicians FROM public.users WHERE role = 'technician';
SELECT COUNT(*) as total_reporters FROM public.users WHERE role = 'employee';
