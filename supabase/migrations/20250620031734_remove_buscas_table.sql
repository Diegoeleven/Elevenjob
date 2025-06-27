-- Migration: Remover tabela buscas obsoleta
-- A tabela pesquisas_usuarios substitui completamente a funcionalidade da tabela buscas

-- Remover políticas da tabela buscas
DROP POLICY IF EXISTS "Users can insert their own searches" ON buscas;
DROP POLICY IF EXISTS "Anyone can view searches by neighborhood" ON buscas;

-- Remover índices da tabela buscas
DROP INDEX IF EXISTS idx_buscas_bairro;
DROP INDEX IF EXISTS idx_buscas_termo;
DROP INDEX IF EXISTS idx_buscas_data;

-- Remover a tabela buscas
DROP TABLE IF EXISTS buscas;

-- Comentário sobre a remoção
COMMENT ON SCHEMA public IS 'Tabela buscas removida - funcionalidade migrada para pesquisas_usuarios'; 