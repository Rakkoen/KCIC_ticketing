-- CRITICAL FIX: Remove equipment_category check constraint
-- Date: 2025-12-30
-- Description: equipment_category should be free text (no constraints) but somehow has a CHECK constraint

-- Drop the incorrect check constraint on equipment_category
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_equipment_category_check;

-- Also drop station check constraint and recreate with correct values
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_station_check;

ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_station_check 
CHECK (station IN ('Halim', 'Karawang', 'Padalarang', 'Tegalluar', 'Depo Tegal Luar'));

-- Verify the columns are correct
COMMENT ON COLUMN public.tickets.equipment_category IS 'Type of equipment/asset (FREE TEXT): e.g., Electrical, Mechanical, IT, Civil, Plumbing, HVAC, Safety';
COMMENT ON COLUMN public.tickets.station IS 'Station location: Halim, Karawang, Padalarang, Tegalluar, or Depo Tegal Luar';
