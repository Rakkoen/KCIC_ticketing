-- Migration: Fix incorrect constraints on tickets table
-- Date: 2025-12-30
-- Description: Remove equipment_category check constraint and fix station constraint

-- 1. Drop the incorrect check constraint on equipment_category
-- This field should be free text, not constrained
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_equipment_category_check;

-- 2. Fix station check constraint to include all valid stations
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_station_check;

ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_station_check 
CHECK (station IN ('Halim', 'Karawang', 'Padalarang', 'Tegalluar', 'Depo Tegal Luar'));

-- 3. Update column comments for documentation
COMMENT ON COLUMN public.tickets.equipment_category IS 'Type of equipment/asset (FREE TEXT): e.g., Electrical, Mechanical, IT, Civil, Plumbing, HVAC, Safety';
COMMENT ON COLUMN public.tickets.station IS 'Station location: Halim, Karawang, Padalarang, Tegalluar, or Depo Tegal Luar';
