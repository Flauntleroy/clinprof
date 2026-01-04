-- ============================================
-- MIGRATION: Add SIMRS Integration Fields
-- ============================================
-- Run this migration to add SIMRS integration support
-- Database: makula_bahalap
-- ============================================

-- 1. Add kd_dokter_simrs to dokter table (maps to SIMRS dokter.kd_dokter)
ALTER TABLE dokter
ADD COLUMN kd_dokter_simrs VARCHAR(20) NULL COMMENT 'Mapping ke kd_dokter di SIMRS' AFTER no_str;

-- 2. Add SIMRS integration fields to booking table
ALTER TABLE booking
ADD COLUMN nik VARCHAR(16) NULL COMMENT 'NIK pasien (16 digit)' AFTER nama_pasien,
ADD COLUMN nomor_kartu VARCHAR(25) NULL COMMENT 'Nomor kartu BPJS/Asuransi' AFTER nik,
ADD COLUMN alamat VARCHAR(200) NULL COMMENT 'Alamat pasien' AFTER nomor_kartu,
ADD COLUMN kd_poli VARCHAR(10) NULL COMMENT 'Kode poliklinik SIMRS' AFTER dokter_id,
ADD COLUMN kd_pj VARCHAR(10) DEFAULT 'UMU' COMMENT 'Kode penjab SIMRS (BPJS/Umum)' AFTER kd_poli,
ADD COLUMN no_rawat VARCHAR(17) NULL COMMENT 'No rawat setelah transfer ke SIMRS' AFTER kd_pj;

-- 3. Add index on nik for patient lookup
ALTER TABLE booking
ADD INDEX idx_booking_nik (nik);

-- 4. Update status enum to match Laravel implementation
ALTER TABLE booking
MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'CHECKIN') DEFAULT 'PENDING';

-- ============================================
-- VERIFICATION: Check if migration successful
-- ============================================
-- Run: DESCRIBE dokter;
-- Run: DESCRIBE booking;
