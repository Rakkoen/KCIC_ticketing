-- Summary script to run all migrations for the KCIC ticketing system
-- This script includes all the necessary SQL to create the complete database schema
-- Run this script in your Supabase SQL editor to set up the entire database

-- Note: This script is for reference only. In practice, you should run each migration
-- file individually in the correct order using the Supabase migration system.

-- Migration order:
-- 1. 0000_initial_schema.sql - Creates users table and auth triggers
-- 2. 0001_tickets_table.sql - Creates tickets table and related policies
-- 3. 0002_incidents_table.sql - Creates incidents table and related tables
-- 4. 0003_create_admin_accounts.sql - Creates test admin accounts
-- 5. 0004_fix_tickets_rls_policy.sql - Fixes RLS policies for tickets
-- 6. 0005_knowledge_base_table.sql - Creates knowledge base tables
-- 7. 0006_team_management_table.sql - Creates team management tables
-- 8. 0007_notifications_table.sql - Creates notification tables
-- 9. 0008_analytics_table.sql - Creates analytics and reporting tables
-- 10. 0009_seed_tickets_and_incidents_universal.sql - Seeds universal sample data for tickets and incidents
-- 11. 0010_update_user_role_trigger.sql - Updates user role trigger to handle registration role selection

-- To run these migrations in Supabase:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to the SQL Editor
-- 3. Run each migration file in order, or use the CLI:
--    supabase db push
--    or
--    supabase migration up

-- After running migrations, your database will have the following tables:
-- 1. users - User profiles and roles
-- 2. tickets - Ticket management
-- 3. incidents - Incident management
-- 4. incident_tickets - Relationship between incidents and tickets
-- 5. incident_history - Audit trail for incidents
-- 6. knowledge_base - Knowledge base articles
-- 7. knowledge_search_history - Search history for knowledge base
-- 8. teams - Team information
-- 9. team_members - Team membership
-- 10. team_projects - Projects assigned to teams
-- 11. notifications - User notifications
-- 12. notification_preferences - User notification settings
-- 13. analytics_reports - Custom reports
-- 14. analytics_snapshots - Report results
-- 15. dashboard_widgets - Custom dashboard widgets
-- 16. activity_logs - Audit trail for all activities

-- Test accounts created by migration 0003:
-- Email: admin@kcic.com, Password: admin123, Role: admin
-- Email: manager@kcic.com, Password: manager123, Role: manager
-- Email: worker@kcic.com, Password: worker123, Role: worker
-- Email: employee@kcic.com, Password: employee123, Role: employee

-- Sample data created by migration 0009:
-- 10 sample tickets with various statuses (new, in_progress, resolved, closed)
-- 6 sample incidents with various severities (low, medium, high, critical)
-- Links between tickets and incidents
-- Incident history entries for tracking changes

-- Role selection feature added by migration 0010:
-- Users can now select their role during registration
-- Trigger updated to properly handle role from user metadata

-- Common queries to verify the database setup:

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Check all functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Check test users
SELECT email, role, full_name
FROM public.users
WHERE email IN ('admin@kcic.com', 'manager@kcic.com', 'worker@kcic.com', 'employee@kcic.com')
ORDER BY role;

-- Check sample tickets
SELECT title, status, priority,
       (SELECT email FROM public.users WHERE id = created_by) as created_by_email,
       (SELECT email FROM public.users WHERE id = assigned_to) as assigned_to_email
FROM public.tickets
ORDER BY created_at DESC;

-- Check sample incidents
SELECT title, status, severity, impact, urgency, category,
       (SELECT email FROM public.users WHERE id = created_by) as created_by_email,
       (SELECT email FROM public.users WHERE id = assigned_to) as assigned_to_email
FROM public.incidents
ORDER BY detected_at DESC;

-- Check incident-ticket relationships
SELECT
    i.title as incident_title,
    t.title as ticket_title,
    t.status as ticket_status
FROM public.incident_tickets it
JOIN public.incidents i ON it.incident_id = i.id
JOIN public.tickets t ON it.ticket_id = t.id
ORDER BY i.title, t.title;