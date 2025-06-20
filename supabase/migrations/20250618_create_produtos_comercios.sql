-- Migration: Criação da tabela produtos_comercios para futura busca por produtos vinculados a comércios locais

create table if not exists public.produtos_comercios (
    id uuid primary key default gen_random_uuid(),
    comercio_id uuid not null references public.comercios(id) on delete cascade,
    nome_produto text not null,
    descricao_produto text,
    categoria_produto text,
    created_at timestamptz not null default now()
);

-- Habilitar Row Level Security
alter table public.produtos_comercios enable row level security;

-- Policy: Permitir insert anônimo (igual outras tabelas públicas)
create policy "Permitir insert anônimo" on public.produtos_comercios
  for insert
  to anon
  with check (true); 