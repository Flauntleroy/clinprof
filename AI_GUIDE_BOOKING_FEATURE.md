# AI Guide: Membuat Fitur Booking Online

> **Panduan untuk AI Agent** - Dokumen ini berisi instruksi lengkap untuk mengimplementasikan fitur booking klinik/rumah sakit.

---

## Daftar Isi

1. [Overview Sistem](#overview-sistem)
2. [Tech Stack](#tech-stack)
3. [Struktur Database](#struktur-database)
4. [Implementasi Backend (API Routes)](#implementasi-backend-api-routes)
5. [Implementasi Frontend (React)](#implementasi-frontend-react)
6. [Dashboard Admin](#dashboard-admin)
7. [Integrasi WhatsApp](#integrasi-whatsapp)
8. [Alur Kerja (Workflow)](#alur-kerja-workflow)
9. [Langkah Implementasi](#langkah-implementasi)

---

## Overview Sistem

Sistem booking ini memungkinkan:
1. **Pasien** membuat booking online melalui website
2. **Admin** menerima notifikasi WhatsApp dan mengelola booking via dashboard
3. **Sistem** mengirim konfirmasi otomatis ke pasien

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE                            │
│      [BookingForm.tsx] → Form booking untuk pasien          │
└────────────────────────┬────────────────────────────────────┘
                         │ POST /api/v1/booking
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                        │
│   [/api/v1/booking/route.ts]                                │
│   - GET: List booking (admin only, requires auth)           │
│   - POST: Create booking (public, rate limited)             │
│   [/api/v1/booking/[id]/route.ts]                           │
│   - PATCH: Update status booking                            │
│   - DELETE: Hapus booking                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────┐  ┌────────────────┐  ┌───────────────┐
│   MySQL    │  │  WhatsApp API  │  │   Dashboard   │
│  Database  │  │   (Fonnte)     │  │  React Admin  │
└────────────┘  └────────────────┘  └───────────────┘
```

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Next.js 14+ (App Router) + TypeScript |
| **Database** | MySQL (via mysql2/promise) |
| **Frontend** | React + TypeScript |
| **Dashboard** | React + React Router |
| **Notifikasi** | WhatsApp API (Fonnte.com) |
| **Styling** | CSS Variables / Tailwind |

---

## Struktur Database

### Tabel `booking`

```sql
CREATE TABLE `booking` (
    `id` VARCHAR(36) PRIMARY KEY,              -- UUID
    `kode_booking` VARCHAR(20) NOT NULL,       -- Format: MB-YYYYMMDD-XXX
    `nama_pasien` VARCHAR(100) NOT NULL,
    `nik` VARCHAR(16) DEFAULT NULL,            -- NIK 16 digit (opsional)
    `nomor_kartu` VARCHAR(20) DEFAULT NULL,    -- Nomor BPJS (opsional)
    `alamat` TEXT DEFAULT NULL,
    `telepon` VARCHAR(20) NOT NULL,            -- Untuk notifikasi WhatsApp
    `email` VARCHAR(100) DEFAULT NULL,
    `tanggal` DATE NOT NULL,                   -- Tanggal booking
    `waktu` TIME NOT NULL,                     -- Jam booking
    `dokter_id` VARCHAR(36) NOT NULL,          -- FK ke tabel dokter
    `kd_poli` VARCHAR(10) DEFAULT NULL,        -- Kode poliklinik (SIMRS)
    `kd_pj` VARCHAR(10) DEFAULT 'UMU',         -- Penanggung jawab (BPJS/Umum)
    `keluhan` TEXT DEFAULT NULL,               -- Keluhan pasien
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'CHECKIN') 
             DEFAULT 'PENDING',
    `catatan_admin` TEXT DEFAULT NULL,
    `notifikasi_terkirim` BOOLEAN DEFAULT FALSE,
    `no_rawat` VARCHAR(20) DEFAULT NULL,       -- Nomor rawat SIMRS
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`dokter_id`) REFERENCES `dokter`(`id`)
);
```

### Penjelasan Status

| Status | Keterangan |
|--------|------------|
| `PENDING` | Booking baru, menunggu konfirmasi admin |
| `CONFIRMED` | Diterima oleh admin |
| `COMPLETED` | Pasien sudah selesai berobat |
| `CANCELLED` | Booking dibatalkan |
| `CHECKIN` | Sudah check-in ke SIMRS/sistem antrian |

### Tabel `dokter` (Referensi)

```sql
CREATE TABLE `dokter` (
    `id` VARCHAR(36) PRIMARY KEY,
    `nama` VARCHAR(100) NOT NULL,
    `spesialisasi` VARCHAR(100),
    `foto` VARCHAR(255) DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Implementasi Backend (API Routes)

### File: `/src/app/api/v1/booking/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { sendBookingConfirmation, sendBookingNotificationToAdmin, getAdminPhone } from '@/lib/whatsapp';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

interface CreateBookingBody {
    nama_pasien: string;
    telepon: string;
    email?: string;
    tanggal: string;
    waktu: string;
    dokter_id: string;
    keluhan?: string;
    nik?: string;
    alamat?: string;
}

// Generate kode booking unik
function generateBookingCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `MB-${dateStr}-${random}`;
}

// GET - List booking (admin only)
export async function GET(request: NextRequest) {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
        return errorResponse(authResult.error, authResult.status);
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const tanggal = url.searchParams.get('tanggal');

    let sql = `SELECT b.*, d.nama as dokter_nama 
               FROM booking b 
               LEFT JOIN dokter d ON b.dokter_id = d.id`;
    const params: string[] = [];

    if (status) {
        sql += ' WHERE b.status = ?';
        params.push(status.toUpperCase());
    }

    sql += ' ORDER BY b.tanggal DESC, b.waktu DESC';

    const bookings = await query(sql, params);
    return successResponse(bookings);
}

// POST - Buat booking baru (public)
export async function POST(request: NextRequest) {
    // Rate limiting: 5 request per menit per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`booking:${clientIP}`, {
        maxRequests: 5,
        windowMs: 60000,
    });

    if (!rateLimit.allowed) {
        return errorResponse('Terlalu banyak permintaan', 429);
    }

    const body: CreateBookingBody = await request.json();

    // Validasi required fields
    const validation = validateRequired(body, ['nama_pasien', 'telepon', 'tanggal', 'waktu', 'dokter_id']);
    if (!validation.valid) {
        return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
    }

    // Cek dokter exists
    const dokter = await queryOne<{ id: string; nama: string }>(
        'SELECT id, nama FROM dokter WHERE id = ? AND is_active = TRUE',
        [body.dokter_id]
    );
    if (!dokter) {
        return errorResponse('Dokter tidak ditemukan', 400);
    }

    // Cek duplikat booking
    const existing = await queryOne(
        `SELECT id FROM booking 
         WHERE telepon = ? AND tanggal = ? AND dokter_id = ? AND status != 'CANCELLED'`,
        [body.telepon, body.tanggal, body.dokter_id]
    );
    if (existing) {
        return errorResponse('Anda sudah memiliki booking pada tanggal tersebut', 400);
    }

    const id = generateId();
    const kodeBooking = generateBookingCode();

    await execute(
        `INSERT INTO booking (id, kode_booking, nama_pasien, nik, alamat, telepon, email, tanggal, waktu, dokter_id, keluhan) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, kodeBooking, body.nama_pasien, body.nik || null, body.alamat || null, 
         body.telepon, body.email || null, body.tanggal, body.waktu, body.dokter_id, body.keluhan || null]
    );

    // Kirim notifikasi WhatsApp ke pasien
    const tanggalFormatted = new Date(body.tanggal).toLocaleDateString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const waResult = await sendBookingConfirmation({
        telepon: body.telepon,
        nama: body.nama_pasien,
        kode: kodeBooking,
        tanggal: tanggalFormatted,
        waktu: body.waktu,
        dokter: dokter.nama,
    });

    if (waResult.success) {
        await execute('UPDATE booking SET notifikasi_terkirim = TRUE WHERE id = ?', [id]);
    }

    // Kirim notifikasi ke admin
    const adminPhone = await getAdminPhone();
    if (adminPhone) {
        await sendBookingNotificationToAdmin({
            telepon: body.telepon,
            nama: body.nama_pasien,
            kode: kodeBooking,
            tanggal: tanggalFormatted,
            waktu: body.waktu,
            dokter: dokter.nama,
            nik: body.nik,
            keluhan: body.keluhan,
            adminPhone,
        });
    }

    return successResponse({
        id,
        kode_booking: kodeBooking,
        notifikasi: waResult.success ? 'terkirim' : 'gagal',
    }, 'Booking berhasil dibuat');
}
```

### File: `/src/app/api/v1/booking/[id]/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { sendBookingConfirmedNotification } from '@/lib/whatsapp';

// GET - Detail booking
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
        return errorResponse(authResult.error, authResult.status);
    }

    const booking = await queryOne(
        `SELECT b.*, d.nama as dokter_nama 
         FROM booking b 
         LEFT JOIN dokter d ON b.dokter_id = d.id 
         WHERE b.id = ?`,
        [params.id]
    );

    if (!booking) {
        return errorResponse('Booking tidak ditemukan', 404);
    }

    return successResponse(booking);
}

// PATCH - Update status booking
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
        return errorResponse(authResult.error, authResult.status);
    }

    const body = await request.json();
    const { status, catatan_admin } = body;

    const booking = await queryOne<any>(
        'SELECT * FROM booking WHERE id = ?',
        [params.id]
    );

    if (!booking) {
        return errorResponse('Booking tidak ditemukan', 404);
    }

    await execute(
        'UPDATE booking SET status = ?, catatan_admin = ? WHERE id = ?',
        [status, catatan_admin || null, params.id]
    );

    // Jika status CONFIRMED, kirim notifikasi ke pasien
    if (status === 'CONFIRMED') {
        const dokter = await queryOne<{ nama: string }>(
            'SELECT nama FROM dokter WHERE id = ?',
            [booking.dokter_id]
        );
        
        await sendBookingConfirmedNotification({
            telepon: booking.telepon,
            nama: booking.nama_pasien,
            kode: booking.kode_booking,
            tanggal: new Date(booking.tanggal).toLocaleDateString('id-ID'),
            waktu: booking.waktu,
            dokter: dokter?.nama || '',
        });
    }

    return successResponse({ success: true }, 'Status booking berhasil diupdate');
}

// DELETE - Hapus booking
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
        return errorResponse(authResult.error, authResult.status);
    }

    await execute('DELETE FROM booking WHERE id = ?', [params.id]);
    return successResponse({ success: true }, 'Booking berhasil dihapus');
}
```

---

## Implementasi Frontend (React)

### File: `/src/app/booking/BookingForm.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';

interface Dokter {
    id: string;
    nama: string;
    spesialisasi: string;
}

export default function BookingForm() {
    const [formData, setFormData] = useState({
        nama_pasien: '',
        nik: '',
        alamat: '',
        telepon: '',
        email: '',
        dokter_id: '',
        tanggal: '',
        waktu: '',
        keluhan: '',
    });

    const [doctors, setDoctors] = useState<Dokter[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<{ message: string; kode: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch daftar dokter saat component mount
    useEffect(() => {
        const fetchDoctors = async () => {
            const response = await fetch('/api/v1/dokter?active=true');
            const data = await response.json();
            if (data.success) {
                setDoctors(data.data.items);
            }
        };
        fetchDoctors();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/v1/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.success) {
                setSuccess({
                    message: 'Booking berhasil! Cek WhatsApp untuk konfirmasi.',
                    kode: data.data?.kode_booking || ''
                });
                // Reset form
                setFormData({
                    nama_pasien: '', nik: '', alamat: '', telepon: '',
                    email: '', dokter_id: '', tanggal: '', waktu: '', keluhan: '',
                });
            } else {
                setError(data.message || 'Gagal mengirim booking');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30',
    ];

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Tampilkan success screen jika berhasil
    if (success) {
        return (
            <div className="success-screen">
                <h2>Booking Berhasil!</h2>
                <p>{success.message}</p>
                <div className="booking-code">
                    <span>Kode Booking:</span>
                    <strong>{success.kode}</strong>
                </div>
                <button onClick={() => setSuccess(null)}>Buat Booking Lagi</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            {/* Data Pasien */}
            <section>
                <h3>Data Pasien</h3>
                
                <label>Nama Lengkap *</label>
                <input
                    type="text"
                    name="nama_pasien"
                    value={formData.nama_pasien}
                    onChange={handleChange}
                    required
                />

                <label>NIK (opsional)</label>
                <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setFormData({ ...formData, nik: val });
                    }}
                    maxLength={16}
                    placeholder="16 digit NIK"
                />

                <label>No. WhatsApp *</label>
                <input
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    required
                />

                <label>Alamat</label>
                <input
                    type="text"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                />

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </section>

            {/* Jadwal Kunjungan */}
            <section>
                <h3>Jadwal Kunjungan</h3>

                <label>Pilih Dokter *</label>
                <select
                    name="dokter_id"
                    value={formData.dokter_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                            {doc.nama} - {doc.spesialisasi}
                        </option>
                    ))}
                </select>

                <label>Tanggal *</label>
                <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    min={getTomorrowDate()}
                    required
                />

                <label>Waktu *</label>
                <select
                    name="waktu"
                    value={formData.waktu}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- Pilih Waktu --</option>
                    {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                    ))}
                </select>

                <label>Keluhan (opsional)</label>
                <textarea
                    name="keluhan"
                    value={formData.keluhan}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Jelaskan keluhan Anda..."
                />
            </section>

            <button type="submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Booking Sekarang'}
            </button>
        </form>
    );
}
```

---

## Dashboard Admin

### File: `/dashboard/src/pages/Booking/BookingList.tsx`

Komponen untuk menampilkan dan mengelola daftar booking:

```tsx
import { useState, useEffect } from "react";
import { apiGet, apiPut } from "../../lib/api";

interface Booking {
    id: string;
    kode_booking: string;
    nama_pasien: string;
    telepon: string;
    tanggal: string;
    waktu: string;
    dokter_nama: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

const STATUS_CONFIG = {
    PENDING: { label: "Menunggu", color: "yellow" },
    CONFIRMED: { label: "Dikonfirmasi", color: "blue" },
    COMPLETED: { label: "Selesai", color: "green" },
    CANCELLED: { label: "Dibatalkan", color: "red" },
};

export default function BookingList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        const response = await apiGet('/api/v1/booking');
        if (response.success) {
            setBookings(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        await apiPut(`/api/v1/booking/${id}`, { status: newStatus });
        fetchBookings(); // Refresh data
    };

    return (
        <div>
            <h1>Daftar Booking</h1>
            <table>
                <thead>
                    <tr>
                        <th>Kode</th>
                        <th>Pasien</th>
                        <th>Tanggal</th>
                        <th>Dokter</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td>{booking.kode_booking}</td>
                            <td>{booking.nama_pasien}</td>
                            <td>{booking.tanggal} {booking.waktu}</td>
                            <td>{booking.dokter_nama}</td>
                            <td>
                                <span className={`badge ${STATUS_CONFIG[booking.status].color}`}>
                                    {STATUS_CONFIG[booking.status].label}
                                </span>
                            </td>
                            <td>
                                {booking.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}>
                                            Terima
                                        </button>
                                        <button onClick={() => handleStatusChange(booking.id, 'CANCELLED')}>
                                            Tolak
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

---

## Integrasi WhatsApp

### File: `/src/lib/whatsapp.ts`

Menggunakan **Fonnte.com** sebagai provider WhatsApp API:

```typescript
const FONNTE_API_URL = 'https://api.fonnte.com/send';

interface SendWhatsAppParams {
    target: string;  // Nomor tujuan (format: 62xxx)
    message: string;
}

// Kirim pesan WhatsApp
export async function sendWhatsApp(params: SendWhatsAppParams): Promise<{ success: boolean; message: string }> {
    const token = process.env.FONNTE_TOKEN;

    if (!token) {
        return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
        const formData = new FormData();
        formData.append('target', params.target);
        formData.append('message', params.message);

        const response = await fetch(FONNTE_API_URL, {
            method: 'POST',
            headers: { 'Authorization': token },
            body: formData,
        });

        const data = await response.json();
        return { success: data.status, message: data.reason || 'Sent' };
    } catch (error) {
        return { success: false, message: 'Failed to send' };
    }
}

// Normalize nomor ke format internasional
function normalizePhone(telepon: string): string {
    let phone = telepon.replace(/\D/g, '');
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    }
    return phone;
}

// Template: Notifikasi booking dibuat
export async function sendBookingConfirmation(data: {
    telepon: string;
    nama: string;
    kode: string;
    tanggal: string;
    waktu: string;
    dokter: string;
}) {
    const message = `*KONFIRMASI BOOKING*

Halo ${data.nama},

Booking Anda telah berhasil diterima:

*No. Booking:* ${data.kode}
*Tanggal:* ${data.tanggal} Pukul ${data.waktu}
*Dokter:* ${data.dokter}
*Status:* Menunggu Konfirmasi

Kami akan segera menghubungi Anda.

Terima kasih! 🙏`;

    return sendWhatsApp({
        target: normalizePhone(data.telepon),
        message,
    });
}

// Template: Notifikasi booking dikonfirmasi
export async function sendBookingConfirmedNotification(data: {
    telepon: string;
    nama: string;
    kode: string;
    tanggal: string;
    waktu: string;
    dokter: string;
}) {
    const message = `*BOOKING DITERIMA*

Halo ${data.nama},

Kabar baik! Booking Anda telah *DITERIMA*.

📋 *No. Booking:* ${data.kode}
📅 *Tanggal:* ${data.tanggal} Pukul ${data.waktu}
👨‍⚕️ *Dokter:* ${data.dokter}
✅ *Status:* DITERIMA

⏰ Harap datang 15 menit sebelum jadwal.

Terima kasih! 🙏`;

    return sendWhatsApp({
        target: normalizePhone(data.telepon),
        message,
    });
}

// Template: Notifikasi ke admin
export async function sendBookingNotificationToAdmin(data: {
    telepon: string;
    nama: string;
    kode: string;
    tanggal: string;
    waktu: string;
    dokter: string;
    nik?: string;
    keluhan?: string;
    adminPhone: string;
}) {
    const message = `*BOOKING BARU*

Ada booking baru yang perlu dikonfirmasi:

*No. Booking:* ${data.kode}
*Nama:* ${data.nama}
*NIK:* ${data.nik || '-'}
*Telepon:* ${data.telepon}
*Tanggal:* ${data.tanggal} ${data.waktu}
*Dokter:* ${data.dokter}
*Keluhan:* ${data.keluhan || '-'}

Silakan buka dashboard untuk konfirmasi.`;

    return sendWhatsApp({
        target: normalizePhone(data.adminPhone),
        message,
    });
}
```

---

## Alur Kerja (Workflow)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. PASIEN BUAT BOOKING                                           │
│    - Isi form di website                                         │
│    - POST /api/v1/booking                                        │
│    - Sistem generate kode booking                                │
│    - Status: PENDING                                             │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. KIRIM NOTIFIKASI                                              │
│    - WhatsApp ke pasien (konfirmasi booking diterima)            │
│    - WhatsApp ke admin (ada booking baru)                        │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. ADMIN REVIEW                                                  │
│    - Buka dashboard                                              │
│    - Review detail booking                                       │
│    - Pilih: TERIMA atau TOLAK                                    │
└───────────────────────────────┬──────────────────────────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│ 4a. JIKA DITERIMA        │         │ 4b. JIKA DITOLAK         │
│   - Status: CONFIRMED    │         │   - Status: CANCELLED    │
│   - Notif WA ke pasien   │         │   - (opsional notif WA)  │
└──────────────────────────┘         └──────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. PASIEN DATANG                                                 │
│    - Check-in di klinik                                          │
│    - Status: CHECKIN / COMPLETED                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## Langkah Implementasi

### Step 1: Setup Database

1. Buat tabel `booking` dan `dokter` sesuai schema di atas
2. Isi data dokter

### Step 2: Buat Helper Libraries

1. `/src/lib/db.ts` - Koneksi MySQL
2. `/src/lib/api.ts` - Helper response & validation
3. `/src/lib/auth.ts` - Autentikasi admin
4. `/src/lib/rateLimit.ts` - Rate limiting
5. `/src/lib/whatsapp.ts` - Integrasi WhatsApp

### Step 3: Buat API Routes

1. `/src/app/api/v1/booking/route.ts` - GET (list), POST (create)
2. `/src/app/api/v1/booking/[id]/route.ts` - GET (detail), PATCH (update), DELETE

### Step 4: Buat Frontend

1. `/src/app/booking/page.tsx` - Halaman booking publik
2. `/src/app/booking/BookingForm.tsx` - Form component

### Step 5: Buat Dashboard Admin

1. `/dashboard/src/pages/Booking/BookingList.tsx` - List booking
2. `/dashboard/src/pages/Booking/BookingDetail.tsx` - Detail & aksi

### Step 6: Setup WhatsApp

1. Daftar di [Fonnte.com](https://fonnte.com)
2. Dapatkan API token
3. Tambahkan ke `.env`:
   ```
   FONNTE_TOKEN=your_token_here
   ```

### Step 7: Testing

1. Test endpoint dengan Postman/curl
2. Test form booking di browser
3. Verifikasi notifikasi WhatsApp

---

## Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=nama_database

# WhatsApp (Fonnte)
FONNTE_TOKEN=your_fonnte_token

# Auth
JWT_SECRET=your_jwt_secret
```

---

## Tips untuk AI Agent

1. **Validasi Input** - Selalu validasi NIK (16 digit), telepon (format Indonesia), email
2. **Rate Limiting** - Penting untuk endpoint publik agar tidak di-abuse
3. **Error Handling** - Tangani error database dan WhatsApp gracefully
4. **Status Management** - Pastikan transisi status valid (PENDING → CONFIRMED/CANCELLED)
5. **Notifikasi** - Kirim WhatsApp di background, jangan block response
6. **Timezone** - Gunakan timezone Indonesia (Asia/Jakarta)

---

*Dokumentasi dibuat Januari 2026 - Next.js Implementation*
