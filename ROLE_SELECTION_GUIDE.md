# Panduan Role Selection pada Registrasi

## Overview
Fitur role selection telah ditambahkan pada halaman registrasi untuk memungkinkan user memilih role mereka saat mendaftar.

## File yang Diubah

1. **src/app/(auth)/register/page.tsx**
   - Ditambahkan field role selection
   - Opsi role: Employee, Worker/IT Support, Manager, Admin
   - Default role: Employee

2. **src/app/api/register/route.ts**
   - Ditambahkan handling untuk parameter role
   - Validasi role yang diterima
   - Role disimpan di user_metadata

3. **supabase/migrations/0010_update_user_role_trigger.sql**
   - Migration baru untuk update trigger handle_new_user
   - Trigger sekarang membaca role dari user_metadata
   - Validasi role dan default ke 'employee' jika tidak valid

4. **supabase/migrations/0000_initial_schema.sql**
   - Update function handle_new_user untuk mendukung role selection
   - Menggunakan COALESCE untuk mendapatkan role dari metadata

## Cara Kerja

### 1. Registrasi User
- User mengisi form registrasi (email, password, full name, role)
- Role dipilih dari dropdown dengan opsi:
  - **Employee**: User biasa dengan akses terbatas
  - **Worker/IT Support**: User dengan akses ke ticket management
  - **Manager**: User dengan akses ke reporting dan team management
  - **Admin**: User dengan akses penuh ke sistem

### 2. Proses Backend
- API menerima data registrasi termasuk role
- Role divalidasi (hanya menerima role yang valid)
- Role disimpan di auth.users.user_metadata
- User dibuat di Supabase Auth

### 3. Trigger Database
- Trigger `handle_new_user` dijalankan saat user baru dibuat
- Role diambil dari user_metadata
- Role disimpan di tabel public.users
- Default ke 'employee' jika role tidak valid

## Validasi Role

```sql
-- Validasi role di API
const validRoles = ['admin', 'manager', 'worker', 'employee']
if (!validRoles.includes(userRole)) {
  return error
}

-- Validasi role di trigger
if user_role not in ('admin', 'manager', 'worker', 'employee') then
    user_role := 'employee';
end if;
```

## Testing Role Selection

### 1. Test Registrasi dengan Role Berbeda
```bash
# Test dengan curl
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "manager"
  }'
```

### 2. Verifikasi di Database
```sql
-- Cek user dengan role
SELECT email, full_name, role, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- Cek auth metadata
SELECT email, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC;
```

### 3. Test Login dengan Role Berbeda
- Login dengan user yang baru dibuat
- Verifikasi role yang tersimpan
- Check apakah akses sesuai dengan role

## Migration Order Update

Untuk menggunakan fitur role selection, pastikan migration dijalankan dalam urutan:

1. 0000_initial_schema.sql (sudah diupdate)
2. 0001_tickets_table.sql
3. 0002_incidents_table.sql
4. 0003_create_admin_accounts.sql
5. 0004_fix_tickets_rls_policy.sql
6. 0005_knowledge_base_table.sql
7. 0006_team_management_table.sql
8. 0007_notifications_table.sql
9. 0008_analytics_table.sql
10. 0009_seed_tickets_and_incidents_universal.sql
11. **0010_update_user_role_trigger.sql** (BARU)

## Perbedaan dengan Test Accounts

Test accounts yang dibuat di migration 0003:
- **admin@kcic.com** - Role: Admin
- **manager@kcic.com** - Role: Manager
- **worker@kcic.com** - Role: Worker
- **employee@kcic.com** - Role: Employee

User baru yang registrasi akan memiliki role sesuai yang dipilih saat registrasi.

## Troubleshooting

### Role Tidak Tersimpan
- Pastikan migration 0010 sudah dijalankan
- Check trigger handle_new_user sudah diupdate
- Verifikasi user_metadata di auth.users

### Error "Invalid role selected"
- Pastikan role yang dikirim valid
- Check validasi di API route
- Verify frontend mengirim role yang benar

### User Tidak Dapat Login dengan Role Baru
- Check apakah user sudah dibuat di auth.users
- Verifikasi role tersimpan di public.users
- Pastikan session dibuat dengan benar

## Best Practices

1. **Default Role**: Selalu gunakan default role 'employee' untuk keamanan
2. **Validasi**: Validasi role di frontend dan backend
3. **Audit**: Log semua perubahan role untuk audit trail
4. **Testing**: Test semua role untuk memastikan akses berfungsi benar

## Security Considerations

1. **Role Validation**: Selalu validasi role sebelum menyimpan
2. **Default to Least Privilege**: Default ke employee jika role tidak valid
3. **Audit Trail**: Log semua perubahan role
4. **Rate Limiting**: Implement rate limiting di endpoint registrasi