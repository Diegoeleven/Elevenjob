/*
  # Initial Schema Setup

  1. Tables
    - usuarios (users)a
    - comercios (businesses)
    - orgaos_publicadores (public organizations)
    - publicacoes (publications)
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
  
  3. Performance
    - Add indexes for frequently queried columns
*/

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  telefone text,
  bairro text,
  tipo_usuario text,
  cidade text
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usuarios' AND policyname = 'Allow insert without auth'
  ) THEN
    CREATE POLICY "Allow insert without auth" ON usuarios
      FOR INSERT TO public
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usuarios' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" ON usuarios
      FOR SELECT TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create comercios table
CREATE TABLE IF NOT EXISTS comercios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  cod_cliente text,
  nome_razao_social text,
  proprietario text,
  cpf_cnpj text,
  endereco text,
  cep text,
  bairro text,
  cidade text,
  numero text,
  telefone text,
  longitude text,
  latitude text,
  foto_fachada text,
  pin_mapa text,
  redes_sociais text,
  plano text DEFAULT 'gratuito',
  acesso_redes_sociais boolean DEFAULT (plano = 'pago'),
  owner_id uuid
);

ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comercios' AND policyname = 'Businesses can manage their own data'
  ) THEN
    CREATE POLICY "Businesses can manage their own data" ON comercios
      FOR ALL TO authenticated
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comercios' AND policyname = 'Anyone can view active businesses'
  ) THEN
    CREATE POLICY "Anyone can view active businesses" ON comercios
      FOR SELECT TO public
      USING (true);
  END IF;
END $$;

-- Create orgaos_publicadores table
CREATE TABLE IF NOT EXISTS orgaos_publicadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_orgao text NOT NULL,
  tipo_orgao text,
  responsavel text,
  telefone text,
  email text,
  endereco text,
  senha_acesso text,
  criado_em timestamptz DEFAULT now(),
  tipo_acesso text DEFAULT 'Painel Administrativo',
  status_orgao text DEFAULT 'Ativo'
);

ALTER TABLE orgaos_publicadores ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orgaos_publicadores' AND policyname = 'Anyone can view organizations'
  ) THEN
    CREATE POLICY "Anyone can view organizations" ON orgaos_publicadores
      FOR SELECT TO public
      USING (true);
  END IF;
END $$;

-- Create publicacoes table
CREATE TABLE IF NOT EXISTS publicacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  tipo_publicacao text DEFAULT 'Informação',
  bairro_destino text,
  nivel_prioridade text DEFAULT 'Normal',
  data_publicacao timestamptz DEFAULT now(),
  status_envio_push boolean DEFAULT false,
  destino text DEFAULT 'Público Geral',
  criado_em timestamptz DEFAULT now(),
  orgao_id uuid REFERENCES orgaos_publicadores(id),
  ativo boolean DEFAULT true NOT NULL
);

ALTER TABLE publicacoes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'publicacoes' AND policyname = 'Anyone can view active publications'
  ) THEN
    CREATE POLICY "Anyone can view active publications" ON publicacoes
      FOR SELECT TO public
      USING (ativo = true);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_comercios_bairro ON comercios(bairro);
CREATE INDEX IF NOT EXISTS idx_comercios_cidade ON comercios(cidade);
CREATE INDEX IF NOT EXISTS idx_publicacoes_bairro_destino ON publicacoes(bairro_destino);
CREATE INDEX IF NOT EXISTS idx_publicacoes_data ON publicacoes(data_publicacao);

-- Create view for filtered publications
CREATE OR REPLACE VIEW vw_publicacoes_com_filtros AS
SELECT 
  p.titulo,
  p.mensagem,
  p.bairro_destino,
  p.nivel_prioridade,
  p.data_publicacao,
  p.status_envio_push,
  p.destino,
  o.nome_orgao,
  o.tipo_orgao
FROM publicacoes p
JOIN orgaos_publicadores o ON p.orgao_id = o.id
WHERE p.ativo = true;