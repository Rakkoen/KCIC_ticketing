# Quick Account Setup Guide

## Problem Analysis
The current API approach is having issues. Let's use a more direct approach by running SQL commands directly in the Supabase Dashboard.

## Step-by-Step Solution

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `hwswzyozejaeilbveknu`

2. **Open SQL Editor**
   - In the left sidebar, click on "SQL Editor"
   - This will open a query interface

3. **Run the Setup Script**
   - Copy the entire content from `setup_accounts.sql`
   - Paste it into the SQL Editor
   - Click "Run" button

4. **Verify Results**
   - After running, you should see 4 rows in the results
   - Check the "Table Editor" > "users" table to confirm roles are set correctly

### Option 2: Using Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your project
supabase link --project-ref hwswzyozejaeilbveknu

# Run the migration
supabase db push
```

### Option 3: Manual Setup (Fallback)

If the above options don't work, you can manually create accounts:

1. **Go to Authentication > Users** in Supabase Dashboard
2. **Click "Add user"** and create these 4 users:
   - Email: admin@kcic.com, Password: admin123
   - Email: manager@kcic.com, Password: manager123  
   - Email: worker@kcic.com, Password: worker123
   - Email: employee@kcic.com, Password: employee123

3. **Update roles in users table:**
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'admin@kcic.com';
   UPDATE public.users SET role = 'manager' WHERE email = 'manager@kcic.com';
   UPDATE public.users SET role = 'worker' WHERE email = 'worker@kcic.com';
   UPDATE public.users SET role = 'employee' WHERE email = 'employee@kcic.com';
   ```

## Verification Steps

After setting up accounts:

1. **Test Login**: Go to `http://localhost:3000/login`
2. **Try each account**:
   - admin@kcic.com / admin123 (should have full access)
   - manager@kcic.com / manager123 (should have management access)
   - worker@kcic.com / worker123 (should have worker access)
   - employee@kcic.com / employee123 (should have basic access)

3. **Check Dashboard Access**: Each role should see different features

## Troubleshooting

### If login fails with "Invalid credentials":
1. Check that users exist in `auth.users` table
2. Verify passwords match exactly (case-sensitive)
3. Ensure email confirmation is bypassed (email_confirm: true)
4. Check that users exist in `public.users` table with correct roles

### If roles don't work:
1. Verify the `role` column values in `public.users` table
2. Check that the trigger function `handle_new_user()` is working
3. Manually update roles using the SQL queries above

## Current Status

✅ **Authentication System**: Working (login/register pages accessible)
✅ **Database Schema**: Complete (users, tickets, incidents tables ready)
✅ **Middleware**: Configured (allows access to auth pages)
⚠️ **Test Accounts**: Need to be created using one of the methods above

## Next Steps

Once accounts are working:
1. Test all role-based permissions
2. Create sample tickets and incidents
3. Verify dashboard functionality
4. Proceed with Phase 5: Knowledge Base System