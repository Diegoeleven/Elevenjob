/*
  # Criar tabela de buscas

  1. Nova Tabela
    - `buscas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para usuarios)
      - `bairro` (text)
      - `termo` (text, not null)
      - `data_busca` (timestamptz, default now)

  2. Segurança
    - Enable RLS na tabela `buscas`
    - Política para usuários autenticados poderem inserir suas próprias buscas
    - Política para visualização de buscas por bairro
*/

CREATE TABLE IF NOT EXISTS buscas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES usuarios(id),
  bairro text NOT NULL,
  termo text NOT NULL,
  data_busca timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE buscas ENABLE ROW LEVEL SECURITY;

-- Política para inserir buscas (usuários podem inserir suas próprias buscas)
CREATE POLICY "Users can insert their own searches"
  ON buscas
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política para visualizar buscas por bairro (para comerciantes)
CREATE POLICY "Anyone can view searches by neighborhood"
  ON buscas
  FOR SELECT
  TO public
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_buscas_bairro ON buscas(bairro);
CREATE INDEX IF NOT EXISTS idx_buscas_termo ON buscas(termo);
CREATE INDEX IF NOT EXISTS idx_buscas_data ON buscas(data_busca);