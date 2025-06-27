-- Migration: Adicionar campos tipo_busca e tipo_filtro à tabela pesquisas_usuarios

-- Adicionar campos necessários para compatibilidade com o código
ALTER TABLE public.pesquisas_usuarios 
ADD COLUMN IF NOT EXISTS tipo_busca text DEFAULT 'texto',
ADD COLUMN IF NOT EXISTS tipo_filtro text DEFAULT 'geral';

-- Criar índice para o novo campo
CREATE INDEX IF NOT EXISTS idx_pesquisas_usuarios_tipo_filtro ON public.pesquisas_usuarios(tipo_filtro);
CREATE INDEX IF NOT EXISTS idx_pesquisas_usuarios_tipo_busca ON public.pesquisas_usuarios(tipo_busca); 