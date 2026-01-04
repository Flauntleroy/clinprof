# Deployment Guide
## Klinik Makula Bahalap Website

---

## 1. Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- PM2 (untuk process management)

---

## 2. Environment Setup

Copy file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

### Required Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=makula_bahalap

# SIMRS Database (optional)
DB_SIMRS_HOST=localhost
DB_SIMRS_PORT=3306
DB_SIMRS_USER=your_simrs_user
DB_SIMRS_PASSWORD=your_simrs_password
DB_SIMRS_NAME=your_simrs_db

# Authentication - WAJIB GANTI!
JWT_SECRET=<generate-with-command-below>
JWT_EXPIRES_IN=7d

# WhatsApp (Fonnte)
FONNTE_TOKEN=your_fonnte_token

# Upload
UPLOAD_MAX_SIZE=20971520
```

### 🔐 Generate JWT Secret

**PENTING**: Jangan gunakan default secret. Generate secret baru:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output dan paste ke `JWT_SECRET` di file `.env`.

---

## 3. Database Setup

```bash
# Import schema
mysql -u root -p makula_bahalap < database/schema.sql

# Import berita migration (optional)
mysql -u root -p makula_bahalap < database/berita_migration.sql
```

---

## 4. Install Dependencies

```bash
# Main website
npm install

# Dashboard 
cd dashboard && npm install
```

---

## 5. Build for Production

```bash
# Build website
npm run build

# Build dashboard
cd dashboard && npm run build
```

---

## 6. Run with PM2

```bash
# Start website
pm2 start npm --name "makula-web" -- start

# Start dashboard (Vite preview or use nginx)
cd dashboard && pm2 start npm --name "makula-dashboard" -- run preview
```

---

## 7. Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name makulabahalap.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /dashboard {
        alias /path/to/dashboard/dist;
        try_files $uri $uri/ /dashboard/index.html;
    }

    # Block direct access to uploads with script execution
    location /uploads {
        add_header X-Content-Type-Options nosniff;
        add_header Content-Security-Policy "default-src 'none'";
    }
}
```

---

## 8. Security Checklist

- [ ] JWT_SECRET sudah diganti dengan secret baru
- [ ] Database password sudah strong
- [ ] HTTPS sudah aktif (gunakan Let's Encrypt)
- [ ] Firewall sudah dikonfigurasi
- [ ] Backup database sudah disetup

---

## 9. Monitoring

```bash
# Check status
pm2 status

# View logs
pm2 logs makula-web

# Restart
pm2 restart makula-web
```
