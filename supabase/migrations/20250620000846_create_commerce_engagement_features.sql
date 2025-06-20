-- Tabela para armazenar comentários dos usuários nos comércios
create table public.comentarios_comercio (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade,
    commerce_id uuid references public.comercios(id) on delete cascade,
    texto text not null check (char_length(texto) > 0)
);

-- Tabela para armazenar as curtidas dos usuários nos comércios
create table public.curtidas_comercio (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade,
    commerce_id uuid references public.comercios(id) on delete cascade,
    -- Garante que um usuário só pode curtir um comércio uma vez
    unique(user_id, commerce_id)
);

-- Adiciona a coluna para vincular uma publicação a um comércio específico
alter table public.publicacoes
add column commerce_id uuid references public.comercios(id) on delete set null;

-- Habilita Row Level Security (RLS) para as novas tabelas
alter table public.comentarios_comercio enable row level security;
alter table public.curtidas_comercio enable row level security;

-- Políticas de acesso para a tabela de comentários
create policy "Usuários podem ver todos os comentários" on public.comentarios_comercio for select using (true);
create policy "Usuários autenticados podem inserir comentários" on public.comentarios_comercio for insert with check (auth.role() = 'authenticated');
create policy "Usuários podem deletar seus próprios comentários" on public.comentarios_comercio for delete using (auth.uid() = user_id);
create policy "Usuários podem atualizar seus próprios comentários" on public.comentarios_comercio for update using (auth.uid() = user_id);

-- Políticas de acesso para a tabela de curtidas
create policy "Usuários podem ver todas as curtidas" on public.curtidas_comercio for select using (true);
create policy "Usuários autenticados podem curtir" on public.curtidas_comercio for insert with check (auth.role() = 'authenticated');
create policy "Usuários podem descurtir (deletar sua curtida)" on public.curtidas_comercio for delete using (auth.uid() = user_id); 