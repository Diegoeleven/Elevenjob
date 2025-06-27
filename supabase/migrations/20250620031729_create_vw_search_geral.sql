-- Migration: Criar view vw_search_geral para busca unificada
-- Esta view combina produtos, promoções e comércios em uma única fonte para busca

CREATE OR REPLACE VIEW vw_search_geral AS
SELECT 
  pc.id,
  'produto' as type,
  COALESCE(pc.nome, pc.nome_produto) as title,
  COALESCE(pc.descricao, pc.descricao_produto) as description,
  pc.imagem_url as image,
  c.latitude::numeric as lat,
  c.longitude::numeric as lng,
  c.endereco as address,
  LOWER(c.bairro) as bairro,
  pc.preco,
  -- Campo unificado para busca (texto concatenado e normalizado)
  LOWER(
    COALESCE(pc.nome, pc.nome_produto, '') || ' ' ||
    COALESCE(pc.descricao, pc.descricao_produto, '') || ' ' ||
    COALESCE(c.bairro, '') || ' ' ||
    COALESCE(c.cidade, '') || ' ' ||
    COALESCE(c.endereco, '')
  ) as texto_unificado,
  pc.created_at,
  'produto' as tipo_filtro
FROM produtos_comercios pc
JOIN comercios c ON pc.comercio_id = c.id
WHERE COALESCE(pc.ativo, true) = true

UNION ALL

SELECT 
  id,
  'promocao' as type,
  titulo as title,
  descricao as description,
  imagem_url as image,
  latitude as lat,
  longitude as lng,
  endereco as address,
  LOWER(bairro) as bairro,
  NULL as preco,
  -- Campo unificado para busca
  LOWER(
    COALESCE(titulo, '') || ' ' ||
    COALESCE(descricao, '') || ' ' ||
    COALESCE(bairro, '') || ' ' ||
    COALESCE(cidade, '') || ' ' ||
    COALESCE(endereco, '')
  ) as texto_unificado,
  created_at,
  'promocao' as tipo_filtro
FROM banners
WHERE ativo = true
  AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
  AND (data_inicio IS NULL OR data_inicio <= CURRENT_DATE)

UNION ALL

SELECT 
  id,
  'comercio' as type,
  nome_razao_social as title,
  COALESCE(descricao, 'Comércio local') as description,
  foto_fachada as image,
  latitude::numeric as lat,
  longitude::numeric as lng,
  endereco as address,
  LOWER(bairro) as bairro,
  NULL as preco,
  -- Campo unificado para busca
  LOWER(
    COALESCE(nome_razao_social, '') || ' ' ||
    COALESCE(descricao, '') || ' ' ||
    COALESCE(bairro, '') || ' ' ||
    COALESCE(cidade, '') || ' ' ||
    COALESCE(endereco, '') || ' ' ||
    COALESCE(proprietario, '')
  ) as texto_unificado,
  created_at,
  'comercio' as tipo_filtro
FROM comercios
WHERE COALESCE(ativo, true) = true;

-- Criar índice para melhorar performance da busca
CREATE INDEX IF NOT EXISTS idx_vw_search_geral_texto_unificado ON vw_search_geral USING gin(to_tsvector('portuguese', texto_unificado));
CREATE INDEX IF NOT EXISTS idx_vw_search_geral_bairro ON vw_search_geral(bairro);
CREATE INDEX IF NOT EXISTS idx_vw_search_geral_type ON vw_search_geral(type);

-- Comentário na view
COMMENT ON VIEW vw_search_geral IS 'View unificada para busca em produtos, promoções e comércios com texto normalizado para busca eficiente'; 