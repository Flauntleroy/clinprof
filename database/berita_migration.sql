-- ============================================
-- MIGRATION: Berita/Artikel Feature
-- Run this after main schema.sql
-- ============================================

USE makula_bahalap;

-- ============================================
-- TABLE: kategori_berita (Kategori artikel)
-- ============================================
CREATE TABLE IF NOT EXISTS kategori_berita (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: berita (Artikel/berita klinik)
-- ============================================
CREATE TABLE IF NOT EXISTS berita (
  id VARCHAR(36) PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NULL COMMENT 'Ringkasan singkat artikel',
  konten LONGTEXT NULL COMMENT 'Konten artikel dalam format HTML',
  thumbnail VARCHAR(500) NULL COMMENT 'URL featured image',
  kategori_id VARCHAR(36) NULL,
  author_id VARCHAR(36) NULL,
  status ENUM('draft', 'published', 'scheduled') DEFAULT 'draft',
  views INT DEFAULT 0 COMMENT 'Jumlah view/baca',
  published_at DATETIME NULL COMMENT 'Waktu publish (untuk scheduled)',
  meta_title VARCHAR(255) NULL COMMENT 'SEO title',
  meta_description TEXT NULL COMMENT 'SEO description',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori_berita(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INDEXES untuk berita
-- ============================================
CREATE INDEX idx_berita_status ON berita(status);
CREATE INDEX idx_berita_kategori ON berita(kategori_id);
CREATE INDEX idx_berita_published_at ON berita(published_at);
CREATE INDEX idx_berita_slug ON berita(slug);

-- ============================================
-- SEED DATA: Default Kategori
-- ============================================
INSERT INTO kategori_berita (id, nama, slug, deskripsi) VALUES
(UUID(), 'Kesehatan Mata', 'kesehatan-mata', 'Artikel seputar kesehatan mata dan tips perawatan'),
(UUID(), 'Info Klinik', 'info-klinik', 'Informasi terbaru dari klinik'),
(UUID(), 'Edukasi', 'edukasi', 'Edukasi kesehatan mata untuk masyarakat');
