-- ============================================
-- FIX ADMIN PASSWORD
-- Run this SQL to fix the admin login
-- Password: admin123
-- ============================================

-- Update existing admin user with correct bcrypt hash
UPDATE users 
SET password = '$2b$10$cakA77MD8RqSTUyFzECbQuyk4qsteNPLmyWE92zx62rBWQTrO8LWm' 
WHERE email = 'admin@makulabahalap.com';

-- If no rows affected, insert new admin user
INSERT IGNORE INTO users (id, email, password, nama, role) VALUES (
  UUID(),
  'admin@makulabahalap.com',
  '$2b$10$cakA77MD8RqSTUyFzECbQuyk4qsteNPLmyWE92zx62rBWQTrO8LWm',
  'Administrator',
  'ADMIN'
);

-- Verify the user exists
SELECT id, email, nama, role FROM users WHERE email = 'admin@makulabahalap.com';
