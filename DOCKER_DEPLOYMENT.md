# Docker Deployment Guide - Makula Bahalap

Panduan lengkap untuk deploy aplikasi Makula Bahalap menggunakan Docker.

---

## Daftar Isi

1. [Arsitektur](#arsitektur)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Konfigurasi](#konfigurasi)
5. [Deploy ke Server](#deploy-ke-server)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │    web      │    │  dashboard  │    │    db       │    │
│   │  (Next.js)  │    │   (React)   │    │  (MySQL)    │    │
│   │  Port 3000  │    │  Port 8080  │    │  Port 3307  │    │
│   └──────┬──────┘    └─────────────┘    └──────┬──────┘    │
│          │                                      │           │
│          └──────────────────┬───────────────────┘           │
│                             │                               │
│                    ┌────────┴────────┐                      │
│                    │   phpmyadmin    │                      │
│                    │   Port 8081     │                      │
│                    └─────────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

| Service | Port | Keterangan |
|---------|------|------------|
| `web` | 3000 | Website utama (Next.js) |
| `dashboard` | 8080 | Admin dashboard (React) |
| `db` | 3307 | MySQL Database |
| `phpmyadmin` | 8081 | Database management |

---

## Prerequisites

### Di Komputer Lokal
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
- Git

### Di Server Ubuntu
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

---

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd makulabahalap
```

### 2. Setup Environment Variables
```bash
# Copy template
cp .env.docker .env

# Edit dengan nilai yang sesuai
nano .env
```

Isi file `.env`:
```env
# Database
DB_NAME=makula_bahalap
DB_USER=root
DB_PASSWORD=your_secure_password
SIMRS_DB_NAME=makula_sik

# JWT (generate dengan: openssl rand -hex 64)
JWT_SECRET=your_very_long_secret_key_here
JWT_EXPIRES_IN=7d

# WhatsApp
FONNTE_TOKEN=your_fonnte_token

# URLs (sesuaikan dengan domain)
NEXT_PUBLIC_APP_NAME=Klinik Spesialis Mata Makula Bahalap
NEXT_PUBLIC_APP_URL=https://makulabahalap.com
NEXT_PUBLIC_API_URL=https://makulabahalap.com/api/v1
```

### 3. Build dan Jalankan
```bash
# Build semua images
docker compose build

# Jalankan semua services
docker compose up -d

# Lihat logs
docker compose logs -f
```

### 4. Akses Aplikasi
| Aplikasi | URL |
|----------|-----|
| Website | http://localhost:3000 |
| Dashboard | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |

---

## Konfigurasi

### File-file Docker

| File | Keterangan |
|------|------------|
| `Dockerfile` | Build image Next.js (web) |
| `dashboard/Dockerfile` | Build image React (dashboard) |
| `dashboard/nginx.conf` | Konfigurasi Nginx untuk dashboard |
| `docker-compose.yml` | Orchestration semua services |
| `.env.docker` | Template environment variables |

### Mengubah Port

Edit `docker-compose.yml`:
```yaml
services:
  web:
    ports:
      - "80:3000"  # Ubah 3000 ke 80
  dashboard:
    ports:
      - "8080:80"  # Dashboard di port 8080
```

### Menambah Volume untuk Uploads

```yaml
services:
  web:
    volumes:
      - ./public/uploads:/app/public/uploads
```

---

## Deploy ke Server

### Step 1: Upload ke Server

**Option A: Git**
```bash
# Di server
git clone <repository-url>
cd makulabahalap
```

**Option B: SCP**
```bash
# Di lokal
scp -r ./makulabahalap user@server:/var/www/
```

### Step 2: Setup di Server
```bash
# Masuk ke folder project
cd /var/www/makulabahalap

# Setup environment
cp .env.docker .env
nano .env  # Edit sesuai kebutuhan

# Build dan jalankan
docker compose up -d --build
```

### Step 3: Setup Reverse Proxy (Nginx)

Install Nginx di host:
```bash
sudo apt install nginx
```

Buat konfigurasi `/etc/nginx/sites-available/makulabahalap`:
```nginx
# Website utama
server {
    listen 80;
    server_name makulabahalap.com www.makulabahalap.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Dashboard Admin
server {
    listen 80;
    server_name admin.makulabahalap.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan dan restart:
```bash
sudo ln -s /etc/nginx/sites-available/makulabahalap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Setup SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d makulabahalap.com -d www.makulabahalap.com -d admin.makulabahalap.com
```

---

## Maintenance

### Restart Services
```bash
docker compose restart
```

### Update Aplikasi
```bash
# Pull kode terbaru
git pull origin main

# Rebuild dan restart
docker compose up -d --build
```

### Lihat Logs
```bash
# Semua services
docker compose logs -f

# Service tertentu
docker compose logs -f web
docker compose logs -f dashboard
docker compose logs -f db
```

### Backup Database
```bash
# Backup
docker compose exec db mysqldump -u root -p makula_bahalap > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T db mysql -u root -p makula_bahalap < backup.sql
```

### Masuk ke Container
```bash
# Masuk ke container web
docker compose exec web sh

# Masuk ke container database
docker compose exec db mysql -u root -p
```

---

## Troubleshooting

### Container tidak bisa start

**Cek logs:**
```bash
docker compose logs web
docker compose logs db
```

**Cek status:**
```bash
docker compose ps
```

### Database connection error

1. Pastikan container `db` sudah healthy:
```bash
docker compose ps db
```

2. Cek password di `.env` sama dengan di container

3. Tunggu beberapa saat, MySQL butuh waktu init

### Port sudah digunakan

```bash
# Cek port yang digunakan
sudo lsof -i :3000

# Atau ubah port di docker-compose.yml
```

### Build error

```bash
# Rebuild tanpa cache
docker compose build --no-cache

# Hapus semua dan mulai ulang
docker compose down -v
docker compose up -d --build
```

### Memory issues

Tambahkan limit di `docker-compose.yml`:
```yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Commands Cheat Sheet

```bash
# Start semua services
docker compose up -d

# Stop semua services
docker compose down

# Rebuild dan start
docker compose up -d --build

# Lihat logs realtime
docker compose logs -f

# Restart service tertentu
docker compose restart web

# Masuk ke container
docker compose exec web sh

# Lihat resource usage
docker stats

# Hapus semua (termasuk volume)
docker compose down -v

# Prune unused resources
docker system prune -a
```

---

## Struktur Akhir

```
makulabahalap/
├── Dockerfile              # Docker untuk Next.js
├── docker-compose.yml      # Orchestration
├── .env.docker             # Template env
├── .env                    # Environment aktif (tidak di-commit)
├── next.config.mjs         # Next.js config (standalone output)
├── dashboard/
│   ├── Dockerfile          # Docker untuk React
│   └── nginx.conf          # Nginx config
├── database/
│   └── *.sql               # SQL files untuk init DB
└── ...
```

---

*Dokumentasi dibuat Januari 2026*
