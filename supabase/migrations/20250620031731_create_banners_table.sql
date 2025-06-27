-- Migration: Criar tabela banners para promoções e anúncios

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  imagem_url text,
  bairro text,
  cidade text,
  endereco text,
  latitude numeric,
  longitude numeric,
  data_inicio date,
  data_fim date,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Anyone can view active banners" ON public.banners
  FOR SELECT TO public
  USING (ativo = true);

CREATE POLICY "Authenticated users can insert banners" ON public.banners
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their banners" ON public.banners
  FOR UPDATE TO authenticated
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_banners_bairro ON public.banners(bairro);
CREATE INDEX IF NOT EXISTS idx_banners_ativo ON public.banners(ativo);
CREATE INDEX IF NOT EXISTS idx_banners_data ON public.banners(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON public.banners(created_at);

-- Inserir alguns dados de exemplo para teste
INSERT INTO public.banners (titulo, descricao, bairro, cidade, ativo) VALUES
('Promoção Especial', 'Descontos imperdíveis em produtos selecionados', 'country', 'Santa Cruz do Sul', true),
('Oferta da Semana', 'Produtos com até 50% de desconto', 'country', 'Santa Cruz do Sul', true),
('Liquidação', 'Tudo com preços especiais', 'country', 'Santa Cruz do Sul', true)
ON CONFLICT DO NOTHING; 