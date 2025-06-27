-- Migration: Atualizar estrutura da tabela produtos_comercios para suportar a view vw_search_geral

-- Adicionar colunas necessárias para a view
ALTER TABLE public.produtos_comercios 
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS descricao text,
ADD COLUMN IF NOT EXISTS preco numeric(10,2),
ADD COLUMN IF NOT EXISTS imagem_url text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Atualizar colunas existentes para manter compatibilidade
UPDATE public.produtos_comercios 
SET 
  nome = nome_produto,
  descricao = descricao_produto
WHERE nome IS NULL OR descricao IS NULL;

-- Adicionar colunas necessárias na tabela banners se não existirem
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Adicionar colunas necessárias na tabela comercios se não existirem
ALTER TABLE public.comercios 
ADD COLUMN IF NOT EXISTS descricao text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_produtos_comercios_ativo ON public.produtos_comercios(ativo);
CREATE INDEX IF NOT EXISTS idx_banners_ativo ON public.banners(ativo);
CREATE INDEX IF NOT EXISTS idx_comercios_ativo ON public.comercios(ativo);
CREATE INDEX IF NOT EXISTS idx_banners_data ON public.banners(data_inicio, data_fim); 