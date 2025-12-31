-- Migration: Fix station constraint to include Depo Tegal Luar
-- Date: 2025-12-30
-- Description: Update station CHECK constraint to include missing 'Depo Tegal Luar' option

-- Drop the existing constraint
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_station_check;

-- Add the updated constraint with 'Depo Tegal Luar' included
ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_station_check 
CHECK (station IN ('Halim', 'Karawang', 'Padalarang', 'Tegalluar', 'Depo Tegal Luar'));

-- Add comment for documentation
COMMENT ON COLUMN public.tickets.station IS 'Station location: Halim, Karawang, Padalarang, Tegalluar, or Depo Tegal Luar';
