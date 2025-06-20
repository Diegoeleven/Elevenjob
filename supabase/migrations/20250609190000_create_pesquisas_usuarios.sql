/*
  # Criar tabela pesquisas_usuarios

  1. Nova Tabela
    - `pesquisas_usuarios`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, nullable)
      - `bairro_usuario` (text, not null)
      - `search_text` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Segurança
    - Enable RLS na tabela `pesquisas_usuarios`
    - Remover policies antigas de insert (se existir)
    - Criar policy "Permitir insert anônimo" para permitir inserts sem autenticação
*/

-- Criar tabela pesquisas_usuarios
CREATE TABLE IF NOT EXISTS public.pesquisas_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  bairro_usuario text NOT NULL,
  search_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pesquisas_usuarios ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas de insert (se existir)
DROP POLICY IF EXISTS "Permitir insert anônimo" ON public.pesquisas_usuarios;

-- Criar policy para permitir insert anônimo
CREATE POLICY "Permitir insert anônimo"
  ON public.pesquisas_usuarios
  FOR INSERT
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pesquisas_usuarios_bairro ON public.pesquisas_usuarios(bairro_usuario);
CREATE INDEX IF NOT EXISTS idx_pesquisas_usuarios_created_at ON public.pesquisas_usuarios(created_at); 