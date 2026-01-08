# KCIC Ticketing System - Database Migrations

This document describes all the database migrations for the KCIC ticketing system.

## Migration Files

The following migration files are located in the `supabase/migrations/` directory:

### 1. 0000_initial_schema.sql
- Creates the `users` table to store user profiles
- Sets up Row Level Security (RLS) policies
- Creates trigger to automatically create user profile on signup
- Defines user roles: admin, manager, worker, employee

### 2. 0001_tickets_table.sql
- Creates the `tickets` table for ticket management
- Defines ticket statuses: new, in_progress, resolved, closed
- Defines ticket priorities: low, medium, high, critical
- Sets up RLS policies for ticket access control
- Creates trigger to automatically update `updated_at` timestamp

### 3. 0002_incidents_table.sql
- Creates the `incidents` table for incident management
- Defines incident statuses: open, investigating, resolved, closed
- Defines severity levels: low, medium, high, critical
- Creates `incident_tickets` table to link incidents with tickets
- Creates `incident_history` table for audit trail
- Sets up RLS policies and triggers

### 4. 0003_create_admin_accounts.sql
- Creates test accounts for different user roles
- Test accounts:
  - admin@kcic.com / admin123 (admin role)
  - manager@kcic.com / manager123 (manager role)
  - worker@kcic.com / worker123 (worker role)
  - employee@kcic.com / employee123 (employee role)

### 5. 0004_fix_tickets_rls_policy.sql
- Fixes RLS policies for the tickets table
- Ensures proper access control for ticket creation and updates

### 6. 0005_knowledge_base_table.sql
- Creates `knowledge_base` table for knowledge management
- Defines article categories: general, technical, process, policy, troubleshooting, faq
- Creates `knowledge_search_history` table to track searches
- Sets up RLS policies for knowledge base access

### 7. 0006_team_management_table.sql
- Creates `teams` table for team information
- Creates `team_members` table for team membership
- Creates `team_projects` table for project management
- Defines team member roles: member, lead, admin
- Sets up RLS policies for team-related tables

### 8. 0007_notifications_table.sql
- Creates `notifications` table for user notifications
- Creates `notification_preferences` table for user settings
- Defines notification types: info, success, warning, error, ticket, incident, team, system
- Creates helper functions for notification management
- Sets up RLS policies for notifications

### 9. 0008_analytics_table.sql
- Creates `analytics_reports` table for custom reports
- Creates `analytics_snapshots` table to store report results
- Creates `dashboard_widgets` table for custom dashboard widgets
- Creates `activity_logs` table for audit trail
- Creates helper functions for analytics and logging
- Sets up RLS policies for analytics tables

## Database Schema

After running all migrations, your database will contain the following tables:

### Core Tables
- `users` - User profiles and roles
- `tickets` - Ticket management
- `incidents` - Incident management

### Relationship Tables
- `incident_tickets` - Links incidents with tickets
- `incident_history` - Audit trail for incidents
- `team_members` - Team membership
- `team_projects` - Projects assigned to teams

### Feature Tables
- `knowledge_base` - Knowledge base articles
- `knowledge_search_history` - Search history
- `notifications` - User notifications
- `notification_preferences` - User notification settings
- `teams` - Team information

### Analytics Tables
- `analytics_reports` - Custom reports
- `analytics_snapshots` - Report results
- `dashboard_widgets` - Custom dashboard widgets
- `activity_logs` - Audit trail for all activities

## Running Migrations

### Using Supabase CLI (Recommended)

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Run all migrations:
   ```bash
   supabase db push
   ```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each migration file in order (0000 to 0008)

### Using the Summary Script

You can also use the `run_all_migrations.sql` file as a reference, but it's recommended to run each migration individually to ensure proper error handling.

## Verifying the Setup

After running migrations, you can verify the setup using the queries provided in `run_all_migrations.sql`:

1. Check all tables exist
2. Verify RLS is enabled
3. Check all policies are in place
4. Verify test accounts are created

## TypeScript Types

The `src/types/database.types.ts` file has been updated with TypeScript definitions for all tables and functions. This provides type safety when using Supabase client in your application.

## Security

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only access their own data unless they have elevated privileges
- Admins and managers have broader access to manage the system
- Public access is restricted to authenticated users only

## Next Steps

1. Run the migrations on your Supabase project
2. Verify the database schema is created correctly
3. Test the application with the provided test accounts
4. Customize the notification preferences and team structure as needed