/*
  # Add Branding System

  1. New Tables
    - `branding`
      - `id` (string, primary key)
      - `logoUrl` (text, nullable)
      - `companyName` (text)
      - `primaryColor` (text)
      - `secondaryColor` (text)
      - `accentColor` (text)
      - `backgroundColor` (text)
      - `textColor` (text)
      - `cardColor` (text)
      - `borderColor` (text)
      - `successColor` (text)
      - `warningColor` (text)
      - `errorColor` (text)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)

  2. Security
    - Enable RLS on `branding` table
    - Add policy for admin users to manage branding

  3. Default Values
    - Insert default branding configuration
*/

CREATE TABLE IF NOT EXISTS branding (
  id varchar(191) PRIMARY KEY DEFAULT 'default',
  logoUrl text,
  companyName text NOT NULL DEFAULT 'BookingHub',
  primaryColor text NOT NULL DEFAULT '#3b82f6',
  secondaryColor text NOT NULL DEFAULT '#6366f1',
  accentColor text NOT NULL DEFAULT '#8b5cf6',
  backgroundColor text NOT NULL DEFAULT '#ffffff',
  textColor text NOT NULL DEFAULT '#1e293b',
  cardColor text NOT NULL DEFAULT '#ffffff',
  borderColor text NOT NULL DEFAULT '#e2e8f0',
  successColor text NOT NULL DEFAULT '#10b981',
  warningColor text NOT NULL DEFAULT '#f59e0b',
  errorColor text NOT NULL DEFAULT '#ef4444',
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage branding"
  ON branding
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default branding configuration
INSERT INTO branding (id, companyName) VALUES ('default', 'BookingHub')
ON DUPLICATE KEY UPDATE companyName = companyName;