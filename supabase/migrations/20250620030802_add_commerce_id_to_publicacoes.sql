alter table public.publicacoes
add column if not exists commerce_id uuid references public.comercios(id); 