/*
  # Add Branding System

  1. New Tables
    - `Branding`
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

  2. Default Values
    - Insert default branding configuration
*/

CREATE TABLE IF NOT EXISTS `Branding` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'default',
  `logoUrl` TEXT NULL,
  `companyName` VARCHAR(191) NOT NULL DEFAULT 'BookingHub',
  `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#3b82f6',
  `secondaryColor` VARCHAR(191) NOT NULL DEFAULT '#6366f1',
  `accentColor` VARCHAR(191) NOT NULL DEFAULT '#8b5cf6',
  `backgroundColor` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
  `textColor` VARCHAR(191) NOT NULL DEFAULT '#1e293b',
  `cardColor` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
  `borderColor` VARCHAR(191) NOT NULL DEFAULT '#e2e8f0',
  `successColor` VARCHAR(191) NOT NULL DEFAULT '#10b981',
  `warningColor` VARCHAR(191) NOT NULL DEFAULT '#f59e0b',
  `errorColor` VARCHAR(191) NOT NULL DEFAULT '#ef4444',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default branding configuration
INSERT INTO `Branding` (`id`, `companyName`) VALUES ('default', 'BookingHub')
ON DUPLICATE KEY UPDATE `companyName` = `companyName`;