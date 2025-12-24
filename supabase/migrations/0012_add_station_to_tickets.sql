alter table tickets 
add column station text check (station in ('Halim', 'Karawang', 'Padalarang', 'Tegalluar'));
