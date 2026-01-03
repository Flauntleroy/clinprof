-- ============================================
-- MAKULA BAHALAP EYE CLINIC DATABASE SCHEMA
-- ============================================
-- Database: makula_bahalap
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS makula_bahalap
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE makula_bahalap;

-- ============================================
-- TABLE: users (Admin users untuk dashboard)
-- ============================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'STAFF') DEFAULT 'ADMIN',
  avatar VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: dokter (Data dokter spesialis)
-- ============================================
CREATE TABLE dokter (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  spesialisasi VARCHAR(255) NOT NULL,
  foto VARCHAR(500) NULL,
  bio TEXT NULL,
  no_str VARCHAR(100) NULL COMMENT 'Nomor Surat Tanda Registrasi',
  is_active BOOLEAN DEFAULT TRUE,
  urutan INT DEFAULT 0 COMMENT 'Urutan tampil di website',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: layanan (Layanan klinik)
-- ============================================
CREATE TABLE layanan (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT NULL,
  icon VARCHAR(255) NULL COMMENT 'Icon class atau path gambar',
  gambar VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  urutan INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: fasilitas (Fasilitas & teknologi klinik)
-- ============================================
CREATE TABLE fasilitas (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT NULL,
  gambar VARCHAR(500) NULL,
  kategori ENUM('FASILITAS', 'TEKNOLOGI') DEFAULT 'FASILITAS',
  is_active BOOLEAN DEFAULT TRUE,
  urutan INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: konten_website (Konten dinamis website)
-- ============================================
CREATE TABLE konten_website (
  id VARCHAR(36) PRIMARY KEY,
  kunci VARCHAR(255) UNIQUE NOT NULL COMMENT 'Key untuk identifikasi konten',
  nilai JSON NOT NULL COMMENT 'Data konten dalam format JSON',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: jadwal (Jadwal praktik dokter)
-- ============================================
CREATE TABLE jadwal (
  id VARCHAR(36) PRIMARY KEY,
  dokter_id VARCHAR(36) NOT NULL,
  hari ENUM('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU') NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dokter_id) REFERENCES dokter(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: booking (Reservasi pasien)
-- ============================================
CREATE TABLE booking (
  id VARCHAR(36) PRIMARY KEY,
  kode_booking VARCHAR(20) UNIQUE NOT NULL COMMENT 'Kode unik booking: MB-YYYYMMDD-XXX',
  nama_pasien VARCHAR(255) NOT NULL,
  telepon VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  dokter_id VARCHAR(36) NOT NULL,
  keluhan TEXT NULL COMMENT 'Keluhan atau catatan pasien',
  status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  catatan_admin TEXT NULL COMMENT 'Catatan dari admin',
  notifikasi_terkirim BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dokter_id) REFERENCES dokter(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: galeri (Galeri foto klinik)
-- ============================================
CREATE TABLE galeri (
  id VARCHAR(36) PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT NULL,
  gambar VARCHAR(500) NOT NULL,
  kategori VARCHAR(100) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  urutan INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: pengaturan (Pengaturan umum)
-- ============================================
CREATE TABLE pengaturan (
  id VARCHAR(36) PRIMARY KEY,
  kunci VARCHAR(255) UNIQUE NOT NULL,
  nilai TEXT NULL,
  tipe ENUM('TEXT', 'JSON', 'BOOLEAN', 'NUMBER') DEFAULT 'TEXT',
  deskripsi VARCHAR(500) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_dokter_is_active ON dokter(is_active);
CREATE INDEX idx_layanan_is_active ON layanan(is_active);
CREATE INDEX idx_fasilitas_is_active ON fasilitas(is_active);
CREATE INDEX idx_fasilitas_kategori ON fasilitas(kategori);
CREATE INDEX idx_booking_tanggal ON booking(tanggal);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_dokter ON booking(dokter_id);
CREATE INDEX idx_jadwal_dokter ON jadwal(dokter_id);
CREATE INDEX idx_jadwal_hari ON jadwal(hari);

-- ============================================
-- SEED DATA: Default Admin User
-- Password: admin123 (hashed with bcrypt)
-- ============================================
INSERT INTO users (id, email, password, nama, role) VALUES (
  UUID(),
  'admin@makulabahalap.com',
  '$2b$10$cakA77MD8RqSTUyFzECbQuyk4qsteNPLmyWE92zx62rBWQTrO8LWm',
  'Administrator',
  'ADMIN'
);

-- ============================================
-- SEED DATA: Default Website Content
-- ============================================
INSERT INTO konten_website (id, kunci, nilai) VALUES
(UUID(), 'hero', JSON_OBJECT(
  'judul', 'Klinik Spesialis Mata Makula Bahalap',
  'subjudul', 'Memberikan pelayanan kesehatan mata terbaik dengan teknologi modern dan tenaga ahli profesional',
  'gambar', '/images/hero-bg.jpg',
  'cta_text', 'Booking Sekarang',
  'cta_link', '/booking'
)),
(UUID(), 'tentang', JSON_OBJECT(
  'judul', 'Tentang Klinik Kami',
  'deskripsi', 'Klinik Spesialis Mata Makula Bahalap hadir untuk memberikan pelayanan kesehatan mata terbaik bagi masyarakat. Dengan dukungan dokter spesialis berpengalaman dan peralatan medis modern, kami berkomitmen untuk menjaga kesehatan penglihatan Anda.',
  'visi', 'Menjadi klinik mata terpercaya dengan pelayanan prima dan teknologi terdepan',
  'misi', 'Memberikan pelayanan kesehatan mata yang berkualitas, terjangkau, dan berorientasi pada kepuasan pasien',
  'gambar', '/images/about.jpg'
)),
(UUID(), 'kontak', JSON_OBJECT(
  'alamat', 'Jl. Contoh No. 123, Kota, Indonesia',
  'telepon', '0812-3456-7890',
  'whatsapp', '6281234567890',
  'email', 'info@makulabahalap.com',
  'maps_embed', '',
  'jam_operasional', JSON_OBJECT(
    'senin_jumat', '08:00 - 17:00',
    'sabtu', '08:00 - 14:00',
    'minggu', 'Tutup'
  )
)),
(UUID(), 'sosial_media', JSON_OBJECT(
  'facebook', '',
  'instagram', '',
  'youtube', '',
  'tiktok', ''
));

-- ============================================
-- SEED DATA: Default Settings
-- ============================================
INSERT INTO pengaturan (id, kunci, nilai, tipe, deskripsi) VALUES
(UUID(), 'nama_klinik', 'Klinik Spesialis Mata Makula Bahalap', 'TEXT', 'Nama klinik'),
(UUID(), 'tagline', 'Mata Sehat, Hidup Berkualitas', 'TEXT', 'Tagline klinik'),
(UUID(), 'fonnte_token', 'nFi7goGNVJiG25gCbL7k', 'TEXT', 'Token API Fonnte untuk WhatsApp'),
(UUID(), 'fonnte_device', '', 'TEXT', 'Device ID Fonnte'),
(UUID(), 'notifikasi_wa_aktif', 'true', 'BOOLEAN', 'Status notifikasi WhatsApp'),
(UUID(), 'template_wa_booking', 'Halo {nama}, terima kasih telah melakukan booking di Klinik Makula Bahalap.\n\nDetail Booking:\nKode: {kode}\nTanggal: {tanggal}\nWaktu: {waktu}\nDokter: {dokter}\n\nMohon datang 15 menit sebelum jadwal. Terima kasih!', 'TEXT', 'Template pesan WhatsApp konfirmasi booking');
