-- Seed Data untuk Tickets dan Incidents
-- File ini berisi query untuk mengisi tabel tickets dan incidents dengan data contoh
-- Jalankan query ini setelah semua migration selesai dijalankan

-- === TICKETS SAMPLE DATA ===
-- Data contoh untuk 10 tiket dengan berbagai status dan prioritas

-- Pastikan user test sudah ada sebelum menjalankan query ini
-- User test yang dibuat di migration 0003:
-- admin@kcic.com (admin)
-- manager@kcic.com (manager) 
-- worker@kcic.com (worker)
-- employee@kcic.com (employee)

INSERT INTO public.tickets (title, description, status, priority, created_by, assigned_to) VALUES
-- Tiket dengan prioritas Critical
('CRM Application Error', 'Aplikasi CRM error saat generate laporan bulanan. Error message: "Connection timeout to database"', 'new', 'critical', 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

-- Tiket dengan prioritas High
('Tidak Akses Folder Bersama', 'Tidak dapat mengakses folder shared \\server\finance. Muncul error "Access denied"', 'in_progress', 'high', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

('VPN Tidak Bisa Connect', 'VPN connection timeout saat mencoba connect dari rumah. Sudah coba restart komputer masih sama', 'new', 'high', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

-- Tiket dengan prioritas Medium
('Printer Lantai 2 Error', 'Printer di lantai 2 tidak bisa print. Lampu indikator blinking orange', 'in_progress', 'medium', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

('Email Sync Lambat', 'Email Outlook tidak sync dengan server. Email baru tidak masuk selama 2 jam', 'new', 'medium', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

('Komputer Lemot', 'Komputer sangat lambat saat buka aplikasi. Butuh 5 menit untuk booting', 'in_progress', 'medium', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

-- Tiket dengan prioritas Low
('Request Software Baru', 'Mohon install Adobe Photoshop untuk keperluan design marketing', 'new', 'low', 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

('Monitor Flicker', 'Monitor utama kadang flicker terutama saat buka aplikasi grafis', 'new', 'low', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

-- Tiket yang sudah selesai
('Password Reset', 'Lupa password email, mohon reset password', 'resolved', 'medium', 
    (SELECT id FROM public.users WHERE email = 'employee@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1)),

('Update Software', 'Update antivirus ke versi terbaru', 'closed', 'low', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1));

-- === INCIDENTS SAMPLE DATA ===
-- Data contoh untuk 6 insiden dengan berbagai tingkat keparahan

INSERT INTO public.incidents (
    title, description, severity, status, impact, urgency, category, 
    affected_systems, affected_users, estimated_downtime_minutes, 
    actual_downtime_minutes, detected_at, created_by, assigned_to,
    root_cause_analysis, resolution_summary
) VALUES
-- Insiden Critical
('Database Server Down', 'Database server utama tidak responsif. Semua aplikasi yang bergantung ke database terdampak', 
    'critical', 'resolved', 'critical', 'critical', 'infrastructure', 
    ARRAY['database', 'crm', 'erp', 'website'], 150, 60, 45, 
    NOW() - INTERVAL '3 days', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1),
    'Memory leak di database server menyebabkan crash',
    'Database server direstart dan dioptimize. Memory upgrade dilakukan'),

-- Insiden High
('Email Service Outage', 'Layanan email down untuk semua user. Tidak bisa kirim dan terima email', 
    'high', 'resolved', 'high', 'high', 'communication', 
    ARRAY['email', 'exchange', 'outlook'], 200, 120, 90, 
    NOW() - INTERVAL '5 days', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1),
    'Corrupted mail queue di Exchange server',
    'Exchange server direstart dan mail queue dibersihkan'),

('Network Down Gedung B', 'Tidak ada koneksi internet di gedung B sejak pagi', 
    'high', 'investigating', 'high', 'high', 'network', 
    ARRAY['network', 'internet', 'wifi'], 50, NULL, NULL, 
    NOW() - INTERVAL '1 day', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1),
    NULL, NULL),

-- Insiden Medium
('VPN Service Degradation', 'Layanan VPN sangat lambat, remote work jadi tidak produktif', 
    'medium', 'open', 'medium', 'medium', 'network', 
    ARRAY['vpn', 'remote-access'], 30, NULL, NULL, 
    NOW() - INTERVAL '2 hours', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1),
    NULL, NULL),

('Website Performance Issues', 'Website perusahaan loading sangat lambat untuk user eksternal', 
    'medium', 'investigating', 'medium', 'medium', 'web', 
    ARRAY['website', 'cms'], 0, NULL, NULL, 
    NOW() - INTERVAL '4 hours', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1),
    NULL, NULL),

-- Insiden Low
('Scheduled Maintenance', 'Maintenance terjadwal untuk file server. Beberapa user mungkin mengalami gangguan sementara', 
    'low', 'closed', 'low', 'low', 'infrastructure', 
    ARRAY['file-server'], 20, 30, 25, 
    NOW() - INTERVAL '7 days', 
    (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1), 
    (SELECT id FROM public.users WHERE email = 'worker@kcic.com' LIMIT 1),
    'Maintenance rutin bulanan',
    'Maintenance selesai, semua sistem normal kembali');

-- === LINK TICKETS TO INCIDENTS ===
-- Menghubungkan beberapa tiket dengan insiden terkait

INSERT INTO public.incident_tickets (incident_id, ticket_id) VALUES
-- Link tiket ke database server incident
((SELECT id FROM public.incidents WHERE title = 'Database Server Down' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'CRM Application Error' LIMIT 1)),
((SELECT id FROM public.incidents WHERE title = 'Database Server Down' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'Komputer Lemot' LIMIT 1)),

-- Link tiket ke email service outage
((SELECT id FROM public.incidents WHERE title = 'Email Service Outage' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'Email Sync Lambat' LIMIT 1)),

-- Link tiket ke network down
((SELECT id FROM public.incidents WHERE title = 'Network Down Gedung B' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'VPN Tidak Bisa Connect' LIMIT 1)),

-- Link tiket ke website performance
((SELECT id FROM public.incidents WHERE title = 'Website Performance Issues' LIMIT 1), 
 (SELECT id FROM public.tickets WHERE title = 'Monitor Flicker' LIMIT 1));

-- === INCIDENT HISTORY ===
-- Membuat riwayat perubahan untuk beberapa insiden

INSERT INTO public.incident_history (incident_id, action, new_values, changed_by) VALUES
-- History untuk Database Server Down
((SELECT id FROM public.incidents WHERE title = 'Database Server Down' LIMIT 1), 
 'CREATE', 
 '{"status": "open", "severity": "critical", "impact": "critical"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Database Server Down' LIMIT 1), 
 'UPDATE', 
 '{"status": "investigating", "assigned_to": "' || (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1) || '"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Database Server Down' LIMIT 1), 
 'UPDATE', 
 '{"status": "resolved", "resolution_summary": "Database server direstart dan dioptimize. Performa meningkat 40%."}', 
 (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1)),

-- History untuk Email Service Outage
((SELECT id FROM public.incidents WHERE title = 'Email Service Outage' LIMIT 1), 
 'CREATE', 
 '{"status": "open", "severity": "high", "impact": "high"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Email Service Outage' LIMIT 1), 
 'UPDATE', 
 '{"status": "investigating", "assigned_to": "' || (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1) || '"}', 
 (SELECT id FROM public.users WHERE email = 'admin@kcic.com' LIMIT 1)),
 
((SELECT id FROM public.incidents WHERE title = 'Email Service Outage' LIMIT 1), 
 'UPDATE', 
 '{"status": "resolved", "resolution_summary": "Exchange server dipatch dan direstart. Email queue dibersihkan."}', 
 (SELECT id FROM public.users WHERE email = 'manager@kcic.com' LIMIT 1));

-- === VERIFICATION QUERIES ===
-- Query untuk verifikasi data yang sudah dimasukkan

-- Cek jumlah tickets per status
SELECT status, COUNT(*) as count 
FROM public.tickets 
GROUP BY status 
ORDER BY status;

-- Cek jumlah tickets per priority
SELECT priority, COUNT(*) as count 
FROM public.tickets 
GROUP BY priority 
ORDER BY priority;

-- Cek jumlah incidents per status
SELECT status, COUNT(*) as count 
FROM public.incidents 
GROUP BY status 
ORDER BY status;

-- Cek jumlah incidents per severity
SELECT severity, COUNT(*) as count 
FROM public.incidents 
GROUP BY severity 
ORDER BY severity;

-- Cek relasi incident-tickets
SELECT 
    i.title as incident_title,
    t.title as ticket_title,
    t.status as ticket_status,
    t.priority as ticket_priority
FROM public.incident_tickets it
JOIN public.incidents i ON it.incident_id = i.id
JOIN public.tickets t ON it.ticket_id = t.id
ORDER BY i.title, t.title;