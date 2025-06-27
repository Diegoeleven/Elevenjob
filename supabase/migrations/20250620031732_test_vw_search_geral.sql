-- Migration: Teste da view vw_search_geral e inserção de dados de teste

-- Inserir dados de teste na tabela banners
INSERT INTO public.banners (titulo, descricao, bairro, cidade, ativo) VALUES
('Promoção Especial Country', 'Descontos imperdíveis em produtos selecionados no bairro Country', 'country', 'Santa Cruz do Sul', true),
('Oferta da Semana Country', 'Produtos com até 50% de desconto no bairro Country', 'country', 'Santa Cruz do Sul', true),
('Liquidação Country', 'Tudo com preços especiais no bairro Country', 'country', 'Santa Cruz do Sul', true)
ON CONFLICT DO NOTHING;

-- Inserir dados de teste na tabela produtos_comercios
INSERT INTO public.produtos_comercios (comercio_id, nome_produto, descricao_produto, nome, descricao, preco, imagem_url, ativo) 
SELECT 
  c.id,
  'Produto Teste Country',
  'Descrição do produto teste no bairro Country',
  'Produto Teste Country',
  'Descrição do produto teste no bairro Country',
  29.90,
  'https://via.placeholder.com/150',
  true
FROM public.comercios c 
WHERE LOWER(c.bairro) = 'country' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verificar se a view está funcionando
-- SELECT * FROM vw_search_geral WHERE bairro = 'country' LIMIT 5; 