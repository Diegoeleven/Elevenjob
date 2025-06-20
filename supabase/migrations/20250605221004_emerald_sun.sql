/*
  # Add public insert policy for usuarios table

  1. Changes
    - Add policy to allow public inserts into usuarios table
    - Policy name: "Allow insert without auth"
    - Applies to: INSERT operations
    - Role: public
    - With check condition: true (allows all inserts)

  2. Security
    - Enables unauthenticated users to create new accounts
    - Required for registration functionality
*/

CREATE POLICY "Allow insert without auth"
  ON usuarios
  FOR INSERT
  TO public
  WITH CHECK (true);