# Panduan Seed Data untuk Tickets dan Incidents

## Overview
Dokumen ini menjelaskan cara menggunakan file seed data untuk mengisi tabel tickets dan incidents dengan data contoh.

## File yang Dibuat
1. **supabase/migrations/0009_seed_tickets_and_incidents.sql** - Migration file untuk seed data
2. **seed_data_tickets_incidents.sql** - File SQL terpisah untuk kemudahan penggunaan

## Cara Menjalankan Seed Data

### Opsi 1: Melalui Migration System (Recommended)
```bash
# Pastikan Anda sudah login ke Supabase CLI
supabase login

# Link ke project Anda
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan migration termasuk seed data
supabase db push
```

### Opsi 2: Langsung di Supabase Dashboard
1. Buka Supabase project dashboard
2. Navigasi ke SQL Editor
3. Copy dan paste isi dari `seed_data_tickets_incidents.sql`
4. Klik "Run" untuk mengeksekusi query

## Data yang Dibuat

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

### Incident History
Setiap insiden memiliki riwayat perubahan:
- Status changes: open → investigating → resolved
- Assignment changes
- Resolution summaries

## Verifikasi Data

Setelah menjalankan seed data, gunakan query berikut untuk verifikasi:

### Cek Jumlah Tickets per Status
```sql
SELECT status, COUNT(*) as count 
FROM public.tickets 
GROUP BY status 
ORDER BY status;
```

### Cek Jumlah Tickets per Prioritas
```sql
SELECT priority, COUNT(*) as count 
FROM public.tickets 
GROUP BY priority 
ORDER BY priority;
```

### Cek Jumlah Incidents per Status
```sql
SELECT status, COUNT(*) as count 
FROM public.incidents 
GROUP BY status 
ORDER BY status;
```

### Cek Jumlah Incidents per Severity
```sql
SELECT severity, COUNT(*) as count 
FROM public.incidents 
GROUP BY severity 
ORDER BY severity;
```

### Cek Hubungan Ticket-Incident
```sql
SELECT 
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

1. **Prasyarat**: Pastikan migration 0000-0008 sudah dijalankan sebelum menjalankan seed data
2. **User Test**: Seed data menggunakan user test yang dibuat di migration 0003
3. **RLS Policies**: Semua data mengikuti Row Level Security yang sudah dikonfigurasi
4. **Timestamps**: Data menggunakan timestamp yang realistis untuk simulasi

## Customization

Anda dapat memodifikasi seed data sesuai kebutuhan:
- Ubah judul dan deskripsi tiket/incident
- Tambah lebih banyak data contoh
- Sesuaikan dengan workflow organisasi Anda
- Tambah data spesifik untuk department tertentu

## Troubleshooting

### Error: "relation 'public.users' does not exist"
- Pastikan migration 0000_initial_schema.sql sudah dijalankan

### Error: "permission denied for relation"
- Pastikan RLS policies sudah dikonfigurasi dengan benar
- Jalankan migration 0004_fix_tickets_rls_policy.sql

### Data tidak muncul di aplikasi
- Refresh browser
- Check console untuk error message
- Verifikasi user login memiliki role yang tepat