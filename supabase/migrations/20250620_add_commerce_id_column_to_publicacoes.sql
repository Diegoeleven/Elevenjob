ALTER TABLE public.publicacoes
ADD COLUMN IF NOT EXISTS commerce_id uuid REFERENCES public.comercios(id); 