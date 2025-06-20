/*
  # Add RLS policies for usuarios table

  1. Security Policies
    - InsertPublic: Allow public users to insert new records (registration)
    - ReadOwnUser: Allow authenticated users to read only their own data

  2. Important Notes
    - Does not modify existing table structure
    - Does not disable RLS
    - Does not create duplicate policies
    - Maintains existing functionality
*/

-- Policy for public registration (INSERT without authentication)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usuarios' AND policyname = 'InsertPublic'
  ) THEN
    CREATE POLICY "InsertPublic" ON usuarios
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for authenticated users to read their own data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usuarios' AND policyname = 'ReadOwnUser'
  ) THEN
    CREATE POLICY "ReadOwnUser" ON usuarios
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id::uuid);
  END IF;
END $$;