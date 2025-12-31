-- Delete only ticket data (NOT dropping tables)
-- This will clear ticket-related data while preserving the table structure

-- Delete dependent data first (to avoid foreign key constraint errors)
DELETE FROM public.ticket_attachments;
DELETE FROM public.ticket_comments;

-- Delete tickets data
DELETE FROM public.tickets;

-- Reset the ticket number sequence so new tickets start from 1 again
ALTER SEQUENCE public.ticket_number_seq RESTART WITH 1;

-- Note: This only deletes data, not the table structure
-- The schema/columns remain intact
-- Run this before applying the seed data migration
