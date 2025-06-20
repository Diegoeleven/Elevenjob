-- Create bairros table
create table bairros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  latitude decimal not null,
  longitude decimal not null
);

-- Add latitude/longitude to comercios
alter table comercios add column latitude decimal;
alter table comercios add column longitude decimal; 