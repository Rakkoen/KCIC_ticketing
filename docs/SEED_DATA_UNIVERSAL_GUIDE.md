# Panduan Seed Data Universal untuk Tickets dan Incidents

## Overview
Dokumen ini menjelaskan cara menggunakan file seed data universal yang tidak bergantung pada role user tertentu. Semua user akan dapat melihat data yang sama tanpa memperhatikan role mereka.

## File yang Dibuat

1. **supabase/migrations/0009_seed_tickets_and_incidents_universal.sql**
   - Migration file resmi dengan pendekatan universal
   - Akan dijalankan otomatis saat menggunakan `supabase db push`

2. **seed_data_tickets_incidents_universal.sql**
   - File SQL terpisah untuk kemudahan penggunaan
   - Dapat dijalankan langsung di Supabase SQL Editor

## Perbedaan dengan Versi Role-Based

Versi universal ini memiliki perbedaan berikut:
- **Tidak bergantung pada email user tertentu** (admin@kcic.com, manager@kcic.com, dll)
- **Menggunakan user ID pertama yang ditemukan** di tabel users
- **Semua data dapat diakses oleh semua user** yang login
- **Lebih sederhana dan universal** untuk keperluan testing

## Cara Menjalankan Seed Data Universal

### Opsi 1: Melalui Migration System (Recommended)
```bash
# Pastikan Anda sudah login ke Supabase CLI
supabase login

# Link ke project Anda
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan migration termasuk seed data universal
supabase db push
```

### Opsi 2: Langsung di Supabase Dashboard
1. Buka Supabase project dashboard
2. Navigasi ke SQL Editor
3. Copy dan paste isi dari `seed_data_tickets_incidents_universal.sql`
4. Klik "Run" untuk mengeksekusi query

## Data Universal yang Dibuat

### Tickets (10 contoh)
1. **CRM Application Error** - Critical, status: new
2. **Tidak Akses Folder Bersama** - High, status: in_progress
3. **VPN Tidak Bisa Connect** - High, status: new
4. **Printer Lantai 2 Error** - Medium, status: in_progress
5. **Email Sync Lambat** - Medium, status: new
6. **Komputer Lemot** - Medium, status: in_progress
7. **Request Software Baru** - Low, status: new
8. **Monitor Flicker** - Low, status: new
9. **Password Reset** - Medium, status: resolved
10. **Update Software** - Low, status: closed

### Incidents (6 contoh)
1. **Database Server Down** - Critical, status: resolved
   - Affected systems: database, crm, erp, website
   - Affected users: 150
   - Downtime: 45 minutes (estimated: 60)

2. **Email Service Outage** - High, status: resolved
   - Affected systems: email, exchange, outlook
   - Affected users: 200
   - Downtime: 90 minutes (estimated: 120)

3. **Network Down Gedung B** - High, status: investigating
   - Affected systems: network, internet, wifi
   - Affected users: 50

4. **VPN Service Degradation** - Medium, status: open
   - Affected systems: vpn, remote-access
   - Affected users: 30

5. **Website Performance Issues** - Medium, status: investigating
   - Affected systems: website, cms
   - Affected users: 0 (external users affected)

6. **Scheduled Maintenance** - Low, status: closed
   - Affected systems: file-server
   - Affected users: 20
   - Downtime: 25 minutes (estimated: 30)

### Hubungan Ticket-Incident
Beberapa tiket dihubungkan dengan insiden terkait:
- CRM Application Error → Database Server Down
- Komputer Lemot → Database Server Down
- Email Sync Lambat → Email Service Outage
- VPN Tidak Bisa Connect → Network Down Gedung B
- Monitor Flicker → Website Performance Issues

## Keuntungan Pendekatan Universal

1. **Tidak perlu setup role user** - Data langsung dapat diakses
2. **Lebih sederhana** - Tidak perlu khawatir tentang permission role
3. **Cocok untuk testing** - Semua user melihat data yang sama
4. **Mudah di-maintain** - Tidak perlu update data per role

## Verifikasi Data Universal

Setelah menjalankan seed data universal, gunakan query berikut untuk verifikasi:

### Cek Jumlah Tickets per Status
```sql
SELECT 'Tickets by Status' as info, status, COUNT(*) as count 
FROM public.tickets 
GROUP BY status 
ORDER BY status;
```

### Cek Jumlah Tickets per Prioritas
```sql
SELECT 'Tickets by Priority' as info, priority, COUNT(*) as count 
FROM public.tickets 
GROUP BY priority 
ORDER BY priority;
```

### Cek Jumlah Incidents per Status
```sql
SELECT 'Incidents by Status' as info, status, COUNT(*) as count 
FROM public.incidents 
GROUP BY status 
ORDER BY status;
```

### Cek Jumlah Incidents per Severity
```sql
SELECT 'Incidents by Severity' as info, severity, COUNT(*) as count 
FROM public.incidents 
GROUP BY severity 
ORDER BY severity;
```

### Cek Hubungan Ticket-Incident
```sql
SELECT 'Incident-Ticket Relations' as info, 
       i.title as incident_title,
       t.title as ticket_title,
       t.status as ticket_status,
       t.priority as ticket_priority
FROM public.incident_tickets it
JOIN public.incidents i ON it.incident_id = i.id
JOIN public.tickets t ON it.ticket_id = t.id
ORDER BY i.title, t.title;
```

## Catatan Penting

1. **Prasyarat**: Pastikan migration 0000-0008 sudah dijalankan
2. **User ID**: Seed data menggunakan user ID pertama yang ditemukan
3. **RLS Policies**: Data mengikuti RLS yang memungkinkan akses universal
4. **Timestamps**: Menggunakan timestamp realistis untuk simulasi

## Customization Data Universal

Anda dapat memodifikasi seed data universal:
- Tambah lebih banyak tickets/incidents
- Ubah judul dan deskripsi sesuai kebutuhan
- Sesuaikan dengan workflow organisasi
- Tambah data spesifik untuk department

## Troubleshooting Universal

### Error: "no rows returned"
- Pastikan ada minimal satu user di tabel users
- Jalankan migration 0003_create_admin_accounts.sql terlebih dahulu

### Error: "permission denied"
- Pastikan RLS policies mengizinkan akses universal
- Check policy untuk tabel tickets dan incidents

### Data tidak muncul
- Refresh browser
- Verifikasi user login
- Check console untuk error message

## Migration Order Update

Untuk menggunakan seed data universal, update order migration:
1. 0000_initial_schema.sql
2. 0001_tickets_table.sql
3. 0002_incidents_table.sql
4. 0003_create_admin_accounts.sql
5. 0004_fix_tickets_rls_policy.sql
6. 0005_knowledge_base_table.sql
7. 0006_team_management_table.sql
8. 0007_notifications_table.sql
9. 0008_analytics_table.sql
10. **0009_seed_tickets_and_incidents_universal.sql** (gunakan ini bukan yang role-based)