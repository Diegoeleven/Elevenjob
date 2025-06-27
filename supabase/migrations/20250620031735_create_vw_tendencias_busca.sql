-- Migration: Criar view vw_tendencias_busca para mostrar tendências de busca por bairro

CREATE OR REPLACE VIEW vw_tendencias_busca AS
SELECT 
  search_text as termo,
  bairro_usuario as bairro,
  COUNT(*) as total_buscas,
  MAX(created_at) as ultima_busca
FROM pesquisas_usuarios
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND search_text IS NOT NULL 
  AND search_text != ''
  AND bairro_usuario IS NOT NULL
  AND bairro_usuario != ''
GROUP BY search_text, bairro_usuario
HAVING COUNT(*) >= 1
ORDER BY total_buscas DESC, ultima_busca DESC;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pesquisas_usuarios_search_text ON pesquisas_usuarios(search_text);
CREATE INDEX IF NOT EXISTS idx_pesquisas_usuarios_bairro_usuario ON pesquisas_usuarios(bairro_usuario);
CREATE INDEX IF NOT EXISTS idx_pesquisas_usuarios_created_at ON pesquisas_usuarios(created_at);

-- Comentário na view
COMMENT ON VIEW vw_tendencias_busca IS 'View para mostrar tendências de busca por bairro nos últimos 30 dias'; 