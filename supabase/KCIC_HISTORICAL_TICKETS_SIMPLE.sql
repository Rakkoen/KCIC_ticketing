-- ========================================
-- KCIC HISTORICAL TICKETS - SIMPLE SEED
-- Import 57 tickets tanpa dependency ke specific users
-- ========================================

-- NOTE: Karena public.users memiliki FK ke auth.users, 
-- kita tidak bisa insert users sembarangan.
-- Tickets akan di-create dengan created_by = NULL atau existing admin user

-- ========================================
-- TICKETS WITHOUT USER ASSIGNMENT
-- ========================================
-- These tickets don't have assigned technicians

INSERT INTO public.tickets (custom_id, title, description, priority, status, station, equipment_category, created_at, first_response_at, resolved_at) VALUES
('HPIO-INC-041225-001', 'TVM 401 tidak berfungsi (abnormal)', 'tidak berfungsi (abnormal)', 'medium', 'closed', 'Tegalluar', 'TVM 401', '2025-12-23 07:35:00', '2025-12-23 07:41:00', '2025-12-23 09:38:00'),
('HPIO-INC-011225-002', 'Tiket tersangkut di loket 2', 'Tiket tersangkut di loket 2', 'high', 'closed', 'Halim', 'Loket 2', '2025-12-23 00:00:00', NULL, NULL),
('HPIO-INC-011225-003', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Halim', 'Stasiun Announcement', '2025-12-23 00:00:00', NULL, NULL),
('HPIO-INC-021225-004', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Karawang', 'Stasiun Announcement', '2025-12-23 00:00:00', NULL, NULL),
('HPIO-INC-031225-005', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Padalarang', 'Stasiun Announcement', '2025-12-23 00:00:00', NULL, NULL),
('HPIO-INC-041225-006', 'Stasiun announcement delay', 'Stasiun announcement delay', 'medium', 'closed', 'Tegalluar', 'Stasiun Announcement', '2025-12-23 00:00:00', NULL, NULL),
('HPIO-INC-041225-007', 'Mesin tiket pintu keluar No. 013 tidak scan QR', 'Terkendala tidak menyescan QR', 'critical', 'closed', 'Tegalluar', 'Mesin tiket pintu keluar No. 013', '2025-12-23 00:00:00', NULL, NULL),
('HPIO-INC-031225-008', 'Gate in 021 LCD error', 'Layar LCD error (kedip-kedip)', 'high', 'closed', 'Padalarang', 'Gate in 021', '2025-12-24 00:00:00', NULL, NULL),
('HPIO-INC-011225-009', 'TVM 105 dikembalikan ke setting awal', 'Sudah tidak dipakai, dikembalikan ke settingan awal', 'medium', 'closed', 'Halim', 'TVM 105', '2025-12-24 00:00:00', NULL, NULL),
('HPIO-INC-011225-010', 'Gate Out 059 restart by sistem', 'Gate out 059 di pintu kedatangan restart by sistem', 'critical', 'closed', 'Halim', 'Gate Out 059', '2025-12-24 00:00:00', NULL, NULL),
('HPIO-INC-041225-011', 'X-Ray lt.2 mati berulang kali', 'X-Ray lt.2 area check barang mati secara tiba-tiba berulang kali', 'critical', 'closed', 'Tegalluar', 'X-Ray', '2025-12-25 00:00:00', NULL, NULL),
('HPIO-INC-041225-012', 'TVM 401 tampilan abnormal', 'tampilan TVM 401 abnormal', 'medium', 'closed', 'Tegalluar', 'TVM 401', '2025-12-25 00:00:00', NULL, NULL),
('HPIO-INC-031225-013', 'Komputer FWC bermasalah', 'Komputer FWC bermasalah', 'critical', 'closed', 'Padalarang', 'Komputer FWC', '2025-12-25 00:00:00', NULL, NULL),
('HPIO-INC-041225-014', 'PIDS peron glitch', 'PIDS peron 3 & 4 timur stasiun Tegalluar glitch', 'medium', 'closed', 'Tegalluar', 'PIDS', '2025-12-26 00:00:00', NULL, NULL),
('HPIO-INC-021225-015', 'LCD tidak menyala', 'Tidak menyala', 'medium', 'closed', 'Karawang', 'LCD', '2025-12-27 00:00:00', NULL, NULL),
('HPIO-INC-011225-016', 'TVM 105 ngelag', 'TVM 105 ngelag tidak bisa pencet layar', 'critical', 'closed', 'Halim', 'TVM 105', '2025-12-27 00:00:00', NULL, NULL),
('HPIO-INC-011225-017', 'TVM 104 Gulungan Tiket Habis', 'Gulungan Tiket Habis di 12:50:47', 'high', 'closed', 'Halim', 'TVM 104', '2025-12-27 00:00:00', NULL, NULL),
('HPIO-INC-011225-018', 'PC kabel tidak konek', 'kabel yg nyambung dari PC ke laptop gabisa konek, untuk kirim manifest', 'medium', 'closed', 'Halim', 'PC', '2025-12-28 00:00:00', NULL, NULL),
('HPIO-INC-031225-019', 'Gate in 17 check in issue', 'case terkait check in. untuk di sistem waktu checkinnya sudah sesuai di jam 13:19 close gate, tetapi pada gatenya masih bisa melakukan checkin di jam 13:21', 'medium', 'in_progress', 'Padalarang', 'Gate in 17', '2025-12-28 00:00:00', NULL, NULL),
('HPIO-INC-011225-020', 'PC Terkendala', 'Terkendala', 'medium', 'closed', 'Halim', 'PC', '2025-12-29 00:00:00', NULL, NULL),
('HPIO-INC-011225-021', 'Bigscreen mati', 'Bigscreen nambah 1 yang mati', 'critical', 'in_progress', 'Halim', 'Bigscreen', '2025-12-29 00:00:00', NULL, NULL),
('HPIO-INC-031225-022', 'Loket FWC gangguan', 'Loket FWC mengalami gangguan', 'critical', 'closed', 'Padalarang', 'FWC', '2025-12-29 00:00:00', NULL, NULL),
('HPIO-INC-041225-023', 'TVM 403 Penangguhan', 'TVM 403 Penangguhan', 'critical', 'closed', 'Tegalluar', 'TVM 403', '2025-12-30 00:00:00', NULL, NULL),
('HPIO-INC-041225-024', 'Printer loket 4 tidak ada tulisan', 'printer loket 4 st halim pada saat print tiket tidak ada tulisannya', 'critical', 'closed', 'Halim', 'Printer', '2025-12-30 00:00:00', NULL, NULL),
('HPIO-INC-031225-025', 'Pintu FA lepas', 'Kondisi Pintu FA lepas', 'medium', 'closed', 'Padalarang', 'Pintu', '2025-12-30 00:00:00', NULL, NULL),
('HPIO-INC-041225-026', 'Xray lt2 tidak bergerak', 'xray lt2 tidak mau maju atau bergerak', 'critical', 'closed', 'Tegalluar', 'Xray', '2025-12-23 00:00:00', NULL, NULL),
('HPIO-INC-011225-027', 'LCD berkedip dan gelap', 'LCD di area TVM lantai 1 stasiun Halim layarnya berkedip dan agak sedikit gelap', 'medium', 'on_escalation', 'Halim', 'LCD', '2025-12-26 00:00:00', NULL, NULL),
('HPIO-INC-011225-028', 'Laptop Tuslah tidak baca data', 'gak bisa kebaca data yg dari pc nya, jadi gabisa kirim manifest', 'high', 'closed', 'Halim', 'Laptop Tuslah', '2025-12-31 00:00:00', NULL, NULL),
('HPIO-INC-010126-001', 'TVM 104 tiket menyangkut', 'Penangguhan TVM 104 disebabkan tiket menyangkut. Teknisi: Dastin', 'critical', 'closed', 'Halim', 'TVM 104', '2026-01-01 10:34:00', '2026-01-01 10:35:00', '2026-01-01 10:50:00'),
('HPIO-INC-010126-002', 'TVM 105 dinamo lemah', 'Penangguhan TVM 104 disebabkan oleh dinamo lemah. Kemudian ditukar dengan dinamo TVM 101. Teknisi: Dastin', 'critical', 'closed', 'Halim', 'TVM 105', '2026-01-01 11:40:00', '2026-01-01 11:43:00', '2026-01-01 12:38:00'),
('HPIO-REQ-010126-001', 'Menukar PDP Screen', 'Menukar PDP Screen FA4 ke area waiting hall yang PDP nya mati. Teknisi: Alif Firdaus & Jalu', 'medium', 'in_progress', 'Halim', 'PDP Screen', '2026-01-01 00:00:00', NULL, NULL),
('HPIO-INC-010126-003', 'PIDS tidak tampil jadwal', 'PIDS Peron 5-6 timur Halim tidak menampilkan jadwal perjalanan. Teknisi: Alif Firdaus & Jalu', 'medium', 'closed', 'Halim', 'PIDS', '2026-01-01 18:45:00', '2026-01-01 18:58:00', '2026-01-02 00:37:00'),
('HPIO-INC-010126-004', 'TVM 106 tidak bisa bayar', 'TVM 106 tidak bisa digunakan, tidak bisa ke metode pembayaran. Teknisi: Alif Firdaus', 'critical', 'closed', 'Halim', 'TVM 106', '2026-01-02 11:32:00', '2026-01-02 11:33:00', '2026-01-02 12:21:00'),
('HPIO-INC-010126-005', 'TVM 105 printer nyangkut', 'TVM 105 error printer nyangkut di tengah, Roller Kotor. Teknisi: Muhamad Rizal', 'high', 'closed', 'Halim', 'TVM 105', '2026-01-02 15:29:00', '2026-01-02 15:29:00', '2026-01-02 15:29:00'),
('HPIO-INC-030126-006', 'CCTV Xray mati', 'CCTV x ray mati. Teknisi: Alif Al Ghifari', 'high', 'closed', 'Padalarang', 'CCTV Xray', '2026-01-02 17:52:00', '2026-01-02 17:53:00', '2026-01-02 17:58:00'),
('HPIO-INC-030126-007', 'TVM 303 tiket tersangkut', 'TVM 303 mengalami penangguhan karena 4 tiket tersangkut di roller tvm. Teknisi: Alif Al Ghifari', 'high', 'closed', 'Padalarang', 'TVM 303', '2026-01-02 20:10:00', '2026-01-02 20:10:00', '2026-01-02 20:32:00'),
('HPIO-INC-030126-008', 'TVM 303 tidak dapat digunakan', 'TVM 303 tidak dapat digunakan', 'high', 'closed', 'Padalarang', 'TVM', '2026-01-02 20:42:00', '2026-01-02 20:43:00', NULL),
('HPIO-INC-030126-009', 'PC loket monitor tidak berfungsi', 'pada PC loket ada bagian di monitor yang tidak dapat ditekan/berfungsi. Teknisi: Alif Al Ghifari', 'medium', 'closed', 'Padalarang', 'PC', '2026-01-03 08:02:00', '2026-01-03 08:02:00', '2026-01-03 08:44:00'),
('HPIO-REQ-010126-002', 'TVM setting tampilan', 'TVM lt.2 halim diminta untuk disesuaikan tampilannya seperti TVM lain. Teknisi: Dastin', 'high', 'closed', 'Halim', 'TVM', '2026-01-03 08:21:00', '2026-01-03 08:21:00', '2026-01-03 08:30:00'),
('HPIO-INC-030126-010', 'Gate 017 tiket sobek nyangkut', 'Terdapat tiket sobek yang nyangkut di gate 017. Teknisi: Fatah', 'high', 'closed', 'Padalarang', 'Gate 017', '2026-01-03 20:56:00', '2026-01-03 20:56:00', '2026-01-03 21:03:00'),
('HPIC-INC-030126-001', 'Printer fotocopy mati', 'printer foto copy tidak nyala. Teknisi: Fatah', 'low', 'closed', 'Padalarang', 'Printer', '2026-01-04 06:17:00', '2026-01-04 06:18:00', '2026-01-04 06:24:00'),
('HPIO-REQ-010126-003', 'TVM tidak tampil iklan', 'tvm 101, 109 - 113 stasiun halim tidak menampilkan iklan. Teknisi: Muhammad Rizal', 'high', 'closed', 'Halim', 'TVM', '2026-01-04 07:40:00', '2026-01-04 07:40:00', '2026-01-04 08:17:00'),
('HPIO-INC-030126-011', 'CCTV Xray error', 'sering error tiba tiba mati mendadak. Teknisi: Fatah', 'high', 'closed', 'Padalarang', 'CCTV Xray', '2026-01-04 08:39:00', '2026-01-04 08:39:00', '2026-01-04 09:52:00'),
('HPIO-INC-030126-012', 'TVM-303 penangguhan koneksi terputus', 'TVM-303 mengalami penangguhan, status di layar koneksi terputus. Teknisi: Fatah', 'high', 'closed', 'Padalarang', 'TVM', '2026-01-05 06:16:00', '2026-01-05 06:16:00', '2026-01-05 06:39:00'),
('HPIO-INC-030126-013', 'X-ray mati', 'X-ray mati. Teknisi: Fatah', 'high', 'closed', 'Padalarang', 'X-ray', '2026-01-05 06:22:00', '2026-01-05 06:22:00', '2026-01-05 07:09:00'),
('HPIO-REQ-010126-004', 'TVM 109-113 tidak tampil iklan', 'TVM 109-113 Tidak menampilkan iklan. Teknisi: Jalu', 'high', 'closed', 'Halim', 'TVM', '2026-01-05 06:34:00', '2026-01-05 06:35:00', '2026-01-05 06:58:00'),
('HPIO-INC-040126-014', 'TVM 403 abnormal', 'tvm 403 stasiun tegalluar status abnormal. Teknisi: Egi Yudhistira', 'high', 'closed', 'Tegalluar', 'TVM', '2026-01-05 07:14:00', '2026-01-05 07:15:00', '2026-01-05 07:23:00'),
('HPIO-INC-040126-015', 'TVM 403 tiket fisik tidak keluar', 'TVM 403 ada 3 tiket pnp yg ga kecetak setelah pembelian di tvm, tp statusnya sdh terbayar, aman sdh masuk manifes, tp ga keluar tiket fisiknya. Teknisi: Egi Yudhistira', 'high', 'closed', 'Tegalluar', 'TVM', '2026-01-06 11:35:00', '2026-01-06 11:36:00', '2026-01-06 11:57:00'),
('HPIO-INC-030126-016', 'TVM 303 penangguhan berulang', 'TVM 303 mengalami penangguhan berulang kali. Teknisi: Fatah', 'high', 'closed', 'Padalarang', 'TVM', '2026-01-06 08:27:00', '2026-01-06 08:28:00', '2026-01-06 08:32:00'),
('HPIO-INC-010126-017', 'Printer tuslah kendala cetak', 'printer tuslah ada kendala saat ngeprint tiket keluarnya lama, dan sebelumnya security ada yg mau cetak tiket karna barcode tidak terbaca lalu ketika diprint dituslah lama dan harus diulang berkali kali dan di gate in tidak terbaca juga tiket fisiknya. Teknisi: Muhammad Rizal', 'high', 'closed', 'Halim', 'Printer', '2026-01-06 09:20:00', '2026-01-06 09:21:00', '2026-01-06 12:58:00'),
('HPIO-INC-030126-018', 'Keyboard CCTV Xray mengetik sendiri', 'keyboard cctv xray pdg mengalami gangguan mengetik sendiri. Teknisi: Fatah', 'medium', 'closed', 'Padalarang', 'Keyboard CCTV Xray', '2026-01-06 09:29:00', '2026-01-06 09:30:00', '2026-01-06 09:38:00'),
('HPIO-INC-010126-019', 'TVM 105 roll tiket habis', 'TVM 105 stasiun halim mengalami penangguhan dikarenakan roll tiket habis. Teknisi: Muhammad Rizal', 'high', 'closed', 'Halim', 'TVM', '2026-01-06 18:45:00', '2026-01-06 18:49:00', '2026-01-06 19:12:00'),
('HPIO-INC-010126-020', 'TVM 104 gulungan habis', 'TVM 104 gulungan habis. Teknisi: PSAC', 'high', 'closed', 'Halim', 'TVM', '2026-01-07 06:57:00', '2026-01-07 06:57:00', '2026-01-07 06:58:00'),
('HPIO-REQ-010126-005', 'TVM 106 setting iklan', 'TVM 106 stasiun halim diminta untuk ditangguhkan dulu sementara, setting menampilkan iklan. Teknisi: Alif Firdaus', 'high', 'closed', 'Halim', 'TVM', '2026-01-07 07:04:00', '2026-01-07 07:05:00', '2026-01-07 07:33:00'),
('HPIO-INC-010126-021', 'PC Tuslah kendala manifest', 'Kendala dalam pengiriman manifest. Teknisi: Alif Firdaus', 'high', 'closed', 'Halim', 'PC Tuslah', '2026-01-07 07:08:00', '2026-01-07 07:09:00', '2026-01-07 07:32:00');

-- Verify import
SELECT COUNT(*) as total_tickets FROM public.tickets WHERE custom_id LIKE 'HPIO-%' OR custom_id LIKE 'HPIC-%';
SELECT * FROM public.tickets WHERE custom_id LIKE 'HPIO-%' OR custom_id LIKE 'HPIC-%' ORDER BY created_at DESC LIMIT 10;
