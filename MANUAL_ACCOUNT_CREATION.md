# Manual Account Creation Guide

## Langkah 1: Buka Supabase Dashboard
1. Buka browser dan navigasi ke: https://supabase.com/dashboard
2. Login dengan akun Supabase Anda
3. Pilih project: `hwswzyozejaeilbveknu`

## Langkah 2: Buat User Authentication
1. Di sidebar kiri, klik **Authentication**
2. Klik **Users**
3. Klik tombol **"Add user"** (biasanya di kanan atas)

## Langkah 3: Isi Data User
Untuk setiap akun, isi data berikut:

### Akun Admin
- **Email**: admin@kcic.com
- **Password**: admin123
- **Full Name**: Admin KCIC
- **Email Confirmation**: Centang (✓)

### Akun Manager
- **Email**: manager@kcic.com
- **Password**: manager123
- **Full Name**: Manager KCIC
- **Email Confirmation**: Centang (✓)

### Akun Worker
- **Email**: worker@kcic.com
- **Password**: worker123
- **Full Name**: Worker KCIC
- **Email Confirmation**: Centang (✓)

### Akun Employee
- **Email**: employee@kcic.com
- **Password**: employee123
- **Full Name**: Employee KCIC
- **Email Confirmation**: Centang (✓)

## Langkah 4: Set Role di Database
Setelah membuat semua 4 akun, kita perlu update role mereka di tabel `public.users`:

1. Di dashboard, klik **Table Editor**
2. Pilih tabel `users`
3. Klik **"Edit"** untuk setiap baris
4. Update kolom `role` sesuai dengan:

| Email | Role yang Diisi |
|-------|----------------|
| admin@kcic.com | admin |
| manager@kcic.com | manager |
| worker@kcic.com | worker |
| employee@kcic.com | employee |

## Langkah 5: Verifikasi dengan SQL
Untuk memastikan role benar, jalankan query ini di SQL Editor:

```sql
-- Update role untuk setiap user
UPDATE public.users SET role = 'admin' WHERE email = 'admin@kcic.com';
UPDATE public.users SET role = 'manager' WHERE email = 'manager@kcic.com';
UPDATE public.users SET role = 'worker' WHERE email = 'worker@kcic.com';
UPDATE public.users SET role = 'employee' WHERE email = 'employee@kcic.com';

-- Verifikasi hasil
SELECT email, full_name, role, created_at FROM public.users WHERE email LIKE '%@kcic.com' ORDER BY role;
```

## Langkah 6: Test Login
1. Buka browser ke: http://localhost:3000/login
2. Test setiap akun:
   - admin@kcic.com / admin123
   - manager@kcic.com / manager123
   - worker@kcic.com / worker123
   - employee@kcic.com / employee123

## Troubleshooting

### Jika login gagal:
1. Pastikan email confirmation sudah dicentang
2. Cek apakah user ada di tabel `auth.users`
3. Cek apakah profile ada di tabel `public.users`
4. Pastikan role sudah benar di tabel `public.users`

### Jika role tidak berfungsi:
1. Jalankan query SQL di atas untuk update role
2. Refresh browser dan login kembali
3. Cek apakah dashboard menampilkan fitur yang sesuai role

## Status Checklist
- [ ] Buat 4 akun di Authentication
- [ ] Update role di tabel users
- [ ] Test login untuk setiap role
- [ ] Verifikasi akses dashboard sesuai role
- [ ] Test pembuatan ticket dan incident