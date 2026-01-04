# Dokumentasi Lengkap Sistem Booking Klinik Bungas

> Dokumentasi ini dibuat untuk panduan implementasi fitur booking di project lain.

---

## Daftar Isi

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Database Schema](#database-schema)
3. [Implementasi Backend](#implementasi-backend)
4. [Implementasi Frontend](#implementasi-frontend)
5. [Integrasi WhatsApp](#integrasi-whatsapp)
6. [Integrasi BPJS](#integrasi-bpjs)
7. [Cara Menerapkan ke Project Lain](#cara-menerapkan-ke-project-lain)

---

## Arsitektur Sistem

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 11 (PHP 8.2+) |
| Frontend | Vue 3 + Inertia.js |
| Database | MySQL 5.7+ |
| Styling | Tailwind CSS |
| Notifikasi | WhatsApp API (Fonnte/WaBlas) |

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Booking    │  │   Admin     │  │  Booking Confirmation   │  │
│  │  Form Page  │  │   Panel     │  │  Page (via WhatsApp)    │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Laravel Routes (api.php)                  ││
│  │  /api/booking/*  |  /api/reg-periksa/*  |  /api/bpjs/*      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │BookingController│  │RegPeriksaCtrl   │  │  BpjsController │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │  WhatsAppService    │  │  BookingToRegPeriksa Service    │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MODEL LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │BookingPeriksa│  │  RegPeriksa  │  │    Pasien    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│  booking_periksa  |  reg_periksa  |  pasien  |  dokter  | ...   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### 1. Tabel `booking_periksa` (Booking Pasien)

Ini adalah tabel utama untuk menyimpan data booking dari pasien.

```sql
CREATE TABLE `booking_periksa` (
  `no_booking` varchar(100) NOT NULL,          -- Primary Key: BK{YYYYMMDD}{NNNN}
  `nik` varchar(400) DEFAULT NULL,             -- NIK pasien (16 digit)
  `nomor_kartu` varchar(255) DEFAULT NULL,     -- Nomor kartu BPJS/Asuransi
  `nama` varchar(40) DEFAULT NULL,             -- Nama lengkap pasien
  `tanggal` datetime DEFAULT NULL,             -- Tanggal & waktu booking
  `alamat` varchar(200) DEFAULT NULL,          -- Alamat pasien
  `no_telp` varchar(40) DEFAULT NULL,          -- Nomor telepon (untuk WhatsApp)
  `email` varchar(50) DEFAULT NULL,            -- Email pasien
  `kd_poli` varchar(55) DEFAULT NULL,          -- FK ke tabel poliklinik
  `kd_dokter` varchar(55) DEFAULT NULL,        -- FK ke tabel dokter
  `kd_pj` varchar(10) DEFAULT NULL,            -- FK ke tabel penjab (BPJS/Umum)
  `status` enum('Diterima','Ditolak','Belum Dibalas','Check In','CheckIn') NOT NULL,
  `catatan` varchar(255) DEFAULT NULL,         -- Catatan/keluhan pasien
  `tanggal_booking` datetime NOT NULL,         -- Waktu booking dibuat
  PRIMARY KEY (`no_booking`),
  KEY `kd_poli` (`kd_poli`),
  CONSTRAINT `booking_periksa_ibfk_1` FOREIGN KEY (`kd_poli`) REFERENCES `poliklinik` (`kd_poli`)
);
```

**Penjelasan Status:**
- `Belum Dibalas` - Booking baru, menunggu konfirmasi dokter
- `Diterima` - Dokter sudah konfirmasi, siap ditransfer ke SIMRS
- `Ditolak` - Dokter menolak booking
- `Check In` / `CheckIn` - Sudah ditransfer ke reg_periksa

---

### 2. Tabel `reg_periksa` (Registrasi SIMRS)

Ini adalah tabel registrasi di sistem SIMRS. Data dari booking akan ditransfer ke sini.

```sql
CREATE TABLE `reg_periksa` (
  `no_reg` varchar(8) DEFAULT NULL,            -- Nomor urut registrasi harian (001, 002, ...)
  `no_rawat` varchar(17) NOT NULL,             -- Primary Key: YYYY/MM/DD/NNNNNN
  `tgl_registrasi` date DEFAULT NULL,          -- Tanggal registrasi
  `jam_reg` time DEFAULT NULL,                 -- Jam registrasi
  `kd_dokter` varchar(20) DEFAULT NULL,        -- FK ke tabel dokter
  `no_rkm_medis` varchar(15) DEFAULT NULL,     -- FK ke tabel pasien (rekam medis)
  `kd_poli` char(5) DEFAULT NULL,              -- FK ke tabel poliklinik
  `p_jawab` varchar(100) DEFAULT NULL,         -- Nama penanggung jawab
  `almt_pj` varchar(200) DEFAULT NULL,         -- Alamat penanggung jawab
  `hubunganpj` varchar(20) DEFAULT NULL,       -- Hubungan dengan pasien
  `biaya_reg` double DEFAULT NULL,             -- Biaya registrasi
  `stts` enum('Belum','Sudah','Batal','Berkas Diterima','Dirujuk','Meninggal','Dirawat','Pulang Paksa') DEFAULT NULL,
  `stts_daftar` enum('-','Lama','Baru') NOT NULL,  -- Pasien lama/baru
  `status_lanjut` enum('Ralan','Ranap') NOT NULL,  -- Rawat jalan/inap
  `kd_pj` char(3) NOT NULL,                    -- FK ke tabel penjab
  `umurdaftar` int(11) DEFAULT NULL,           -- Umur saat daftar
  `sttsumur` enum('Th','Bl','Hr') DEFAULT NULL,    -- Satuan umur
  `status_bayar` enum('Sudah Bayar','Belum Bayar') NOT NULL,
  `status_poli` enum('Lama','Baru') NOT NULL,  -- Pernah ke poli ini atau tidak
  PRIMARY KEY (`no_rawat`),
  KEY `no_rkm_medis` (`no_rkm_medis`),
  CONSTRAINT `reg_periksa_ibfk_7` FOREIGN KEY (`no_rkm_medis`) REFERENCES `pasien` (`no_rkm_medis`)
);
```

---

### 3. Tabel `pasien` (Master Data Pasien)

Tabel master untuk menyimpan data pasien yang sudah terdaftar di SIMRS.

```sql
CREATE TABLE `pasien` (
  `no_rkm_medis` varchar(15) NOT NULL,    -- Primary Key: nomor rekam medis (000001, 000002, ...)
  `nm_pasien` varchar(40) DEFAULT NULL,   -- Nama pasien
  `no_ktp` varchar(20) DEFAULT NULL,      -- NIK (digunakan untuk linking dengan booking)
  `jk` enum('L','P') DEFAULT NULL,        -- Jenis kelamin
  `tmp_lahir` varchar(15) DEFAULT NULL,   -- Tempat lahir
  `tgl_lahir` date DEFAULT NULL,          -- Tanggal lahir
  `nm_ibu` varchar(40) NOT NULL,          -- Nama ibu kandung
  `alamat` varchar(200) DEFAULT NULL,     -- Alamat
  `gol_darah` enum('A','B','O','AB','-') DEFAULT NULL,
  `pekerjaan` varchar(60) DEFAULT NULL,
  `stts_nikah` enum('BELUM MENIKAH','MENIKAH','JANDA','DUDHA','JOMBLO') DEFAULT NULL,
  `agama` varchar(12) DEFAULT NULL,
  `tgl_daftar` date DEFAULT NULL,         -- Tanggal pertama kali daftar
  `no_tlp` varchar(40) DEFAULT NULL,      -- Nomor telepon
  `umur` varchar(30) NOT NULL,            -- Umur dalam format "XX Th"
  `kd_pj` char(3) NOT NULL,               -- FK ke penjab default
  `no_peserta` varchar(25) DEFAULT NULL,  -- Nomor peserta BPJS
  `email` varchar(50) NOT NULL,
  -- ... kolom lainnya untuk data demografis
  PRIMARY KEY (`no_rkm_medis`),
  KEY `no_ktp` (`no_ktp`)
);
```

---

### 4. Tabel Pendukung

```sql
-- Tabel Dokter
CREATE TABLE `dokter` (
  `kd_dokter` varchar(20) NOT NULL,
  `nm_dokter` varchar(50) DEFAULT NULL,
  `jk` enum('L','P') DEFAULT NULL,
  `tmp_lahir` varchar(20) DEFAULT NULL,
  `tgl_lahir` date DEFAULT NULL,
  `gol_drh` enum('A','B','O','AB','-') DEFAULT NULL,
  `agama` varchar(15) DEFAULT NULL,
  `almt_tgl` varchar(60) DEFAULT NULL,
  `no_telp` varchar(20) DEFAULT NULL,     -- Untuk notifikasi WhatsApp
  `stts_nikah` enum('BELUM MENIKAH','MENIKAH') DEFAULT NULL,
  `alumni` varchar(50) DEFAULT NULL,
  `no_ijn_praktek` varchar(30) DEFAULT NULL,
  `kd_sps` char(5) DEFAULT NULL,           -- FK ke spesialis
  `status` enum('1','0') DEFAULT NULL,
  PRIMARY KEY (`kd_dokter`)
);

-- Tabel Poliklinik
CREATE TABLE `poliklinik` (
  `kd_poli` char(5) NOT NULL,
  `nm_poli` varchar(50) DEFAULT NULL,
  `registrasi` double DEFAULT NULL,
  `registrasilama` double DEFAULT NULL,
  `status` enum('1','0') DEFAULT NULL,
  PRIMARY KEY (`kd_poli`)
);

-- Tabel Penjab (Penanggung Jawab/Asuransi)
CREATE TABLE `penjab` (
  `kd_pj` char(3) NOT NULL,
  `png_jawab` varchar(100) NOT NULL,      -- Nama: "BPJS", "UMUM", dst.
  `atribut` enum('COB','Non COB','-') NOT NULL,
  `status` enum('1','0') NOT NULL,
  PRIMARY KEY (`kd_pj`)
);
```

---

## Implementasi Backend

### 1. Model BookingPeriksa

File: `app/Models/BookingPeriksa.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class BookingPeriksa extends Model
{
    protected $table = 'booking_periksa';
    protected $primaryKey = 'no_booking';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; 
    
    protected $fillable = [
        'no_booking', 'nik', 'nomor_kartu', 'nama', 'tanggal',
        'alamat', 'no_telp', 'email', 'kd_poli', 'kd_dokter',
        'kd_pj', 'status', 'catatan', 'tanggal_booking'
    ];

    protected $casts = [
        'tanggal' => 'datetime',
        'tanggal_booking' => 'datetime',
    ];

    // Konstanta Status
    const STATUS_DITERIMA = 'Diterima';
    const STATUS_DITOLAK = 'Ditolak';
    const STATUS_BELUM_DIBALAS = 'Belum Dibalas';
    const STATUS_CHECK_IN = 'Check In';
    const STATUS_CHECKIN = 'CheckIn';

    // Relasi ke Poliklinik
    public function poliklinik(): BelongsTo
    {
        return $this->belongsTo(Poliklinik::class, 'kd_poli', 'kd_poli');
    }

    // Relasi ke Dokter
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Dokter::class, 'kd_dokter', 'kd_dokter');
    }

    // Relasi ke Pasien (via NIK)
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class, 'nik', 'no_ktp');
    }

    /**
     * Generate nomor booking otomatis
     * Format: BK{YYYYMMDD}{0001-9999}
     */
    public static function generateBookingNumber(): string
    {
        $date = Carbon::now()->format('Ymd');
        $lastBooking = self::where('no_booking', 'like', "BK{$date}%")
            ->orderBy('no_booking', 'desc')
            ->first();

        if ($lastBooking) {
            $lastNumber = (int) substr($lastBooking->no_booking, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "BK{$date}{$newNumber}";
    }

    /**
     * Cek apakah status masih bisa diubah
     */
    public function canChangeStatus(): bool
    {
        return !in_array($this->status, [self::STATUS_CHECK_IN, self::STATUS_CHECKIN]);
    }

    /**
     * Update status booking
     */
    public function updateStatus(string $status, string $catatan = null): bool
    {
        if (!$this->canChangeStatus()) {
            return false;
        }

        $this->status = $status;
        
        if ($catatan && !empty(trim($catatan))) {
            $this->catatan = $catatan;
        }

        return $this->save();
    }
}
```

---

### 2. BookingController - Membuat Booking Baru

File: `app/Http/Controllers/BookingController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\BookingPeriksa;
use App\Models\Dokter;
use App\Models\Poliklinik;
use App\Models\Penjab;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    protected $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Ambil data untuk form booking (dokter, poli, penjab)
     */
    public function getFormData(): JsonResponse
    {
        $data = [
            'dokter' => Dokter::getForSelect(),       // [{value: 'DR001', label: 'dr. Ahmad'}]
            'poliklinik' => Poliklinik::getForSelect(),
            'penjab' => Penjab::getForSelect(),
        ];

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Simpan booking baru
     */
    public function store(Request $request): JsonResponse
    {
        // Validasi input
        $validated = $request->validate([
            'nik' => 'nullable|string|size:16|regex:/^[0-9]{16}$/',
            'nomor_kartu' => 'nullable|string|max:13',
            'nama' => 'required|string|max:40',
            'tanggal' => 'required|date_format:Y-m-d H:i',
            'alamat' => 'nullable|string|max:200',
            'no_telp' => 'required|string|max:40',
            'email' => 'nullable|email|max:50',
            'kd_poli' => 'required|string|exists:poliklinik,kd_poli',
            'kd_dokter' => 'required|string|exists:dokter,kd_dokter',
            'kd_pj' => 'required|string|exists:penjab,kd_pj',
            'catatan' => 'nullable|string|max:255',
        ]);

        // Validasi tanggal tidak di masa lalu
        $bookingDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['tanggal']);
        if ($bookingDateTime->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal booking harus di masa depan'
            ], 422);
        }

        // Cek duplikasi booking
        if (!empty($validated['nik'])) {
            $existingBooking = BookingPeriksa::where('nik', $validated['nik'])
                ->where('tanggal', $validated['tanggal'])
                ->whereIn('status', ['Diterima', 'Belum Dibalas'])
                ->first();

            if ($existingBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memiliki booking pada waktu tersebut'
                ], 422);
            }
        }

        // Cek kuota dokter (max 20 pasien per hari)
        $bookingCount = BookingPeriksa::where('kd_dokter', $validated['kd_dokter'])
            ->whereDate('tanggal', $validated['tanggal'])
            ->whereIn('status', ['Diterima', 'Belum Dibalas', 'Check In', 'CheckIn'])
            ->count();

        if ($bookingCount >= 20) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota dokter pada tanggal tersebut sudah penuh'
            ], 422);
        }

        DB::beginTransaction();

        // Generate nomor booking
        $noBooking = BookingPeriksa::generateBookingNumber();

        // Simpan booking
        $booking = BookingPeriksa::create([
            'no_booking' => $noBooking,
            'nik' => $validated['nik'],
            'nomor_kartu' => $validated['nomor_kartu'],
            'nama' => $validated['nama'],
            'tanggal' => $validated['tanggal'],
            'alamat' => $validated['alamat'],
            'no_telp' => $validated['no_telp'],
            'email' => $validated['email'],
            'kd_poli' => $validated['kd_poli'],
            'kd_dokter' => $validated['kd_dokter'],
            'kd_pj' => $validated['kd_pj'],
            'status' => BookingPeriksa::STATUS_BELUM_DIBALAS,
            'catatan' => $validated['catatan'],
            'tanggal_booking' => Carbon::now(),
        ]);

        $booking->load(['poliklinik', 'dokter', 'penjab']);

        DB::commit();

        // Kirim notifikasi WhatsApp
        $this->sendWhatsAppNotifications($booking);

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibuat',
            'data' => [
                'no_booking' => $booking->no_booking,
                'nama' => $booking->nama,
                'tanggal' => $booking->tanggal_formatted,
                'dokter' => $booking->dokter->nm_dokter,
                'poliklinik' => $booking->poliklinik->nm_poli,
                'status' => $booking->status
            ]
        ]);
    }

    /**
     * Kirim notifikasi WhatsApp ke pasien dan dokter
     */
    private function sendWhatsAppNotifications($booking)
    {
        // Kirim ke pasien
        if (!empty($booking->no_telp)) {
            $this->whatsAppService->sendBookingConfirmationToPatient($booking);
        }

        // Kirim ke dokter dengan link konfirmasi
        if (!empty($booking->dokter->no_telp)) {
            $this->whatsAppService->sendBookingNotificationToDoctor($booking);
        }
    }
}
```

---

### 3. Konfirmasi Booking oleh Dokter

```php
/**
 * Konfirmasi booking via token dari WhatsApp
 * Token format (base64): { booking_id, doctor_id, expires_at, hash }
 */
public function confirmBooking(Request $request, $token): JsonResponse
{
    // Rate limiting
    $clientIp = $request->ip();
    $rateLimitKey = "booking_confirm:{$clientIp}";
    
    if (cache()->get($rateLimitKey, 0) >= 5) {
        return response()->json([
            'success' => false,
            'message' => 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.'
        ], 429);
    }
    cache()->put($rateLimitKey, cache()->get($rateLimitKey, 0) + 1, 60);

    // Decode token
    $decoded = base64_decode($token);
    $data = json_decode($decoded, true);

    // Validasi struktur token
    if (!$data || !isset($data['booking_id'], $data['doctor_id'], $data['expires_at'], $data['hash'])) {
        return response()->json(['success' => false, 'message' => 'Token tidak valid'], 400);
    }

    // Cek expired
    if (Carbon::parse($data['expires_at'])->isPast()) {
        return response()->json(['success' => false, 'message' => 'Token sudah kedaluwarsa'], 400);
    }

    // Validasi hash
    $salt = config('app.key') . date('Y-m-d');
    $expectedHash = hash('sha256', $data['booking_id'] . $data['doctor_id'] . $salt);
    
    if (!hash_equals($expectedHash, $data['hash'])) {
        return response()->json(['success' => false, 'message' => 'Token tidak valid'], 400);
    }

    // Cari booking
    $booking = BookingPeriksa::where('no_booking', $data['booking_id'])->first();

    if (!$booking) {
        return response()->json(['success' => false, 'message' => 'Booking tidak ditemukan'], 404);
    }

    // Cek status
    if ($booking->status !== BookingPeriksa::STATUS_BELUM_DIBALAS) {
        return response()->json([
            'success' => false,
            'message' => 'Booking sudah dikonfirmasi sebelumnya',
            'current_status' => $booking->status
        ], 422);
    }

    // Update status
    $booking->updateStatus(BookingPeriksa::STATUS_DITERIMA);

    // Kirim notifikasi ke pasien
    $this->sendConfirmationNotificationToPatient($booking);

    return response()->json([
        'success' => true,
        'message' => 'Booking berhasil dikonfirmasi!',
        'data' => [
            'no_booking' => $booking->no_booking,
            'status' => $booking->status,
            'patient_name' => $booking->nama
        ]
    ]);
}

/**
 * Generate token konfirmasi untuk dokter
 */
public function generateConfirmationToken($booking): string
{
    $salt = config('app.key') . date('Y-m-d');
    
    $data = [
        'booking_id' => $booking->no_booking,
        'doctor_id' => $booking->kd_dokter,
        'expires_at' => Carbon::now()->addHours(24)->toIso8601String(),
        'hash' => hash('sha256', $booking->no_booking . $booking->kd_dokter . $salt)
    ];
    
    return base64_encode(json_encode($data));
}
```

---

### 4. Service Transfer ke SIMRS

File: `app/Services/BookingToRegPeriksa.php`

```php
<?php

namespace App\Services;

use App\Models\BookingPeriksa;
use App\Models\RegPeriksa;
use App\Models\Pasien;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingToRegPeriksa
{
    /**
     * Transfer data dari booking_periksa ke reg_periksa
     * 
     * @param string $noBooking Nomor booking yang akan ditransfer
     * @return array Result dengan success, message, dan data
     */
    public function transferBookingToRegPeriksa(string $noBooking): array
    {
        try {
            DB::beginTransaction();

            // 1. Ambil data booking
            $booking = BookingPeriksa::where('no_booking', $noBooking)->first();
            
            if (!$booking) {
                throw new \Exception("Booking {$noBooking} tidak ditemukan");
            }

            // 2. Validasi status booking
            if (!in_array($booking->status, ['Diterima', 'Check In', 'CheckIn'])) {
                throw new \Exception("Status booking harus 'Diterima' untuk dapat ditransfer");
            }

            // 3. Cari pasien berdasarkan NIK
            $pasien = Pasien::where('no_ktp', $booking->nik)->first();

            if (!$pasien) {
                throw new \Exception("Pasien dengan NIK {$booking->nik} belum terdaftar di SIMRS. Daftarkan pasien terlebih dahulu.");
            }

            // 4. Cek duplikasi registrasi
            $existingReg = RegPeriksa::where('no_rkm_medis', $pasien->no_rkm_medis)
                ->whereDate('tgl_registrasi', $booking->tanggal)
                ->where('kd_poli', $booking->kd_poli)
                ->first();

            if ($existingReg) {
                throw new \Exception("Pasien sudah terdaftar pada tanggal tersebut dengan nomor rawat {$existingReg->no_rawat}");
            }

            // 5. Generate nomor rawat dan nomor registrasi
            $noRawat = RegPeriksa::generateNoRawat($booking->tanggal);  // 2025/01/03/000001
            $noReg = RegPeriksa::generateNoReg($booking->tanggal);      // 001

            // 6. Hitung umur pasien
            $umurData = $this->calculateAge($pasien->tgl_lahir, $booking->tanggal);

            // 7. Mapping dan simpan ke reg_periksa
            $regPeriksa = RegPeriksa::create([
                'no_reg' => $noReg,
                'no_rawat' => $noRawat,
                'tgl_registrasi' => Carbon::parse($booking->tanggal)->format('Y-m-d'),
                'jam_reg' => Carbon::parse($booking->tanggal)->format('H:i:s'),
                'kd_dokter' => $booking->kd_dokter,
                'no_rkm_medis' => $pasien->no_rkm_medis,
                'kd_poli' => $booking->kd_poli,
                'p_jawab' => $pasien->nm_pasien,           // Default: nama sendiri
                'almt_pj' => $pasien->alamat,
                'hubunganpj' => 'DIRI SENDIRI',
                'biaya_reg' => 0,
                'stts' => 'Belum',                         // Belum dilayani
                'stts_daftar' => $this->determineSttsDataftar($pasien->no_rkm_medis),
                'status_lanjut' => 'Ralan',                // Rawat jalan
                'kd_pj' => $booking->kd_pj ?? 'UMU',
                'umurdaftar' => $umurData['umur'],
                'sttsumur' => $umurData['satuan'],
                'status_bayar' => 'Belum Bayar',
                'status_poli' => $this->determineStatusPoli($pasien->no_rkm_medis, $booking->kd_poli)
            ]);

            // 8. Update status booking
            $booking->update(['status' => BookingPeriksa::STATUS_CHECKIN]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Transfer berhasil',
                'data' => [
                    'no_rawat' => $noRawat,
                    'no_reg' => $noReg,
                    'no_rkm_medis' => $pasien->no_rkm_medis,
                    'nama_pasien' => $pasien->nm_pasien
                ]
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Hitung umur pasien
     */
    private function calculateAge(string $tglLahir, string $tglRegistrasi): array
    {
        $lahir = Carbon::parse($tglLahir);
        $registrasi = Carbon::parse($tglRegistrasi);

        $diffInYears = $lahir->diffInYears($registrasi);

        if ($diffInYears > 0) {
            return ['umur' => $diffInYears, 'satuan' => 'Th'];
        }
        
        $diffInMonths = $lahir->diffInMonths($registrasi);
        if ($diffInMonths > 0) {
            return ['umur' => $diffInMonths, 'satuan' => 'Bl'];
        }
        
        return ['umur' => $lahir->diffInDays($registrasi), 'satuan' => 'Hr'];
    }

    /**
     * Tentukan status daftar (Lama/Baru)
     */
    private function determineSttsDataftar(string $noRkmMedis): string
    {
        return RegPeriksa::where('no_rkm_medis', $noRkmMedis)->exists() ? 'Lama' : 'Baru';
    }

    /**
     * Tentukan status poli (Lama/Baru)
     */
    private function determineStatusPoli(string $noRkmMedis, string $kdPoli): string
    {
        return RegPeriksa::where('no_rkm_medis', $noRkmMedis)
            ->where('kd_poli', $kdPoli)
            ->exists() ? 'Lama' : 'Baru';
    }
}
```

---

### 5. Model RegPeriksa

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RegPeriksa extends Model
{
    protected $table = 'reg_periksa';
    protected $primaryKey = 'no_rawat';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    // Status constants
    const STATUS_BELUM = 'Belum';
    const STATUS_SUDAH = 'Sudah';
    const STATUS_BATAL = 'Batal';

    /**
     * Generate nomor rawat: YYYY/MM/DD/NNNNNN
     */
    public static function generateNoRawat($tanggal = null): string
    {
        $tanggal = $tanggal ? Carbon::parse($tanggal) : Carbon::now();
        $prefix = $tanggal->format('Y/m/d');
        
        $lastReg = self::where('no_rawat', 'like', $prefix . '%')
            ->orderBy('no_rawat', 'desc')
            ->first();

        $newNumber = $lastReg 
            ? (int) substr($lastReg->no_rawat, -6) + 1 
            : 1;

        return $prefix . '/' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate nomor registrasi harian: 001, 002, ...
     */
    public static function generateNoReg($tanggal = null): string
    {
        $tanggal = $tanggal ? Carbon::parse($tanggal) : Carbon::now();
        
        $lastReg = self::whereDate('tgl_registrasi', $tanggal->format('Y-m-d'))
            ->orderBy('no_reg', 'desc')
            ->first();

        $newNumber = ($lastReg && $lastReg->no_reg) 
            ? (int) $lastReg->no_reg + 1 
            : 1;

        return str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
}
```

---

### 6. Registrasi Pasien Baru

```php
/**
 * Daftarkan pasien dari data booking ke SIMRS
 */
public function registerPatientFromBooking(Request $request, $noBooking): JsonResponse
{
    $booking = BookingPeriksa::where('no_booking', $noBooking)->first();

    if (!$booking) {
        return response()->json(['success' => false, 'message' => 'Booking tidak ditemukan'], 404);
    }

    // Cek apakah NIK sudah terdaftar
    if (Pasien::where('no_ktp', $booking->nik)->exists()) {
        return response()->json([
            'success' => false,
            'message' => 'Pasien dengan NIK ini sudah terdaftar'
        ], 422);
    }

    // Generate nomor rekam medis
    $noRkmMedis = Pasien::generateNoRkmMedis();  // 000001, 000002, ...

    // Ekstrak tanggal lahir dari NIK (digit 7-12)
    $tglLahir = $this->extractBirthDateFromNik($booking->nik);

    // Ekstrak jenis kelamin dari NIK (digit 7, jika > 40 = perempuan)
    $jk = (int)substr($booking->nik, 6, 2) > 40 ? 'P' : 'L';

    DB::beginTransaction();

    $patient = Pasien::create([
        'no_rkm_medis' => $noRkmMedis,
        'nm_pasien' => strtoupper($booking->nama),
        'no_ktp' => $booking->nik,
        'jk' => $jk,
        'tgl_lahir' => $tglLahir,
        'alamat' => $booking->alamat,
        'no_tlp' => $booking->no_telp,
        'email' => $booking->email ?? '',
        'tgl_daftar' => Carbon::now()->format('Y-m-d'),
        'kd_pj' => $booking->kd_pj ?? 'UMU',
        'no_peserta' => $booking->nomor_kartu,
        // ... kolom lainnya dengan default values
    ]);

    DB::commit();

    return response()->json([
        'success' => true,
        'message' => 'Pasien berhasil didaftarkan',
        'patient' => [
            'no_rkm_medis' => $patient->no_rkm_medis,
            'nama' => $patient->nm_pasien
        ]
    ]);
}

/**
 * Ekstrak tanggal lahir dari NIK
 * NIK: PPKKCC TTBBTT NNNN
 * TT = tanggal (jika > 40, kurangi 40 untuk perempuan)
 * BB = bulan
 * TT = tahun (2 digit)
 */
private function extractBirthDateFromNik($nik): string
{
    $day = (int)substr($nik, 6, 2);
    $month = (int)substr($nik, 8, 2);
    $year = (int)substr($nik, 10, 2);
    
    // Jika perempuan, tanggal ditambah 40
    if ($day > 40) {
        $day -= 40;
    }
    
    // Konversi 2 digit tahun ke 4 digit
    $fullYear = ($year <= 30) ? 2000 + $year : 1900 + $year;
    
    return Carbon::createFromDate($fullYear, $month, $day)->format('Y-m-d');
}
```

---

## Implementasi Frontend

### Vue Component: Booking.vue

```vue
<template>
  <form @submit.prevent="submitBooking" class="space-y-6">
    <!-- NIK Field -->
    <div>
      <label>NIK (16 digit)</label>
      <input 
        v-model="form.nik"
        type="text" 
        maxlength="16"
        @input="handleNikInput"
        :disabled="isLoadingNik"
      />
      <p v-if="nikSuccess" class="text-green-600">{{ nikSuccess }}</p>
    </div>

    <!-- Nama (otomatis terisi dari NIK jika ada di BPJS) -->
    <div>
      <label>Nama Lengkap</label>
      <input v-model="form.nama" :readonly="isNameFromNik" />
    </div>

    <!-- Tanggal & Waktu -->
    <div>
      <label>Tanggal & Waktu Konsultasi</label>
      <input v-model="form.tanggal" type="datetime-local" :min="minDateTime" />
    </div>

    <!-- Pilih Dokter -->
    <div>
      <label>Pilih Dokter</label>
      <select v-model="form.kd_dokter">
        <option v-for="dokter in formOptions.dokter" :value="dokter.value">
          {{ dokter.label }}
        </option>
      </select>
    </div>

    <!-- Submit -->
    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Mengirim...' : 'Kirim Booking' }}
    </button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const form = ref({
  nik: '',
  nomor_kartu: '',
  nama: '',
  tanggal: '',
  alamat: '',
  no_telp: '',
  email: '',
  kd_poli: '',
  kd_dokter: '',
  kd_pj: '',
  catatan: ''
})

const formOptions = ref({ dokter: [], poliklinik: [], penjab: [] })
const isSubmitting = ref(false)
const isLoadingNik = ref(false)
const isNameFromNik = ref(false)

// Load form options on mount
onMounted(async () => {
  const response = await fetch('/api/booking/form-data')
  const result = await response.json()
  if (result.success) {
    formOptions.value = result.data
    // Set default poli & penjab
    form.value.kd_poli = formOptions.value.poliklinik.find(p => p.label.includes('Umum'))?.value
    form.value.kd_pj = formOptions.value.penjab.find(p => p.label.includes('Umum'))?.value
  }
})

// Handle NIK input - validasi dan ambil data BPJS
const handleNikInput = async (e) => {
  const nik = e.target.value.replace(/\D/g, '')
  form.value.nik = nik

  if (nik.length === 16) {
    isLoadingNik.value = true
    try {
      const response = await fetch('/api/bpjs/check-nik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik })
      })
      const result = await response.json()
      
      if (result.metaData?.code === '200' && result.response?.peserta) {
        form.value.nama = result.response.peserta.nama
        form.value.nomor_kartu = result.response.peserta.noKartu
        isNameFromNik.value = true
      }
    } finally {
      isLoadingNik.value = false
    }
  }
}

// Submit booking
const submitBooking = async () => {
  isSubmitting.value = true
  try {
    const response = await fetch('/api/booking/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const result = await response.json()
    
    if (result.success) {
      // Show success with receipt
      alert(`Booking berhasil! Nomor: ${result.data.no_booking}`)
    } else {
      alert(result.message)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

---

## Integrasi WhatsApp

### WhatsAppService

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private $apiUrl;
    private $apiToken;

    public function __construct()
    {
        // Gunakan Fonnte atau WaBlas
        $this->apiUrl = config('services.whatsapp.url', 'https://api.fonnte.com/send');
        $this->apiToken = config('services.whatsapp.token');
    }

    /**
     * Kirim pesan WhatsApp
     */
    public function sendMessage(string $phone, string $message): array
    {
        try {
            // Format nomor telepon ke format internasional
            $phone = $this->formatPhoneNumber($phone);

            $response = Http::withHeaders([
                'Authorization' => $this->apiToken
            ])->post($this->apiUrl, [
                'target' => $phone,
                'message' => $message
            ]);

            Log::info('WhatsApp: Pesan berhasil dikirim', [
                'phone' => $phone,
                'response' => $response->json()
            ]);

            return ['success' => true, 'message' => 'Pesan terkirim'];
        } catch (\Exception $e) {
            Log::error('WhatsApp: Gagal mengirim', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Kirim notifikasi booking ke pasien
     */
    public function sendBookingConfirmationToPatient($booking): array
    {
        $message = "BOOKING DITERIMA - KLINIK BUNGAS\n\n" .
            "Halo {$booking->nama},\n\n" .
            "Booking Anda telah kami terima:\n\n" .
            "Nomor Booking: {$booking->no_booking}\n" .
            "Tanggal: " . $booking->tanggal->format('d/m/Y H:i') . "\n" .
            "Dokter: {$booking->dokter->nm_dokter}\n" .
            "Poli: {$booking->poliklinik->nm_poli}\n\n" .
            "Status: Menunggu Konfirmasi Dokter\n\n" .
            "Kami akan menghubungi Anda setelah dokter mengkonfirmasi booking.\n\n" .
            "Terima kasih! 🙏";

        return $this->sendMessage($booking->no_telp, $message);
    }

    /**
     * Kirim notifikasi booking ke dokter dengan link konfirmasi
     */
    public function sendBookingNotificationToDoctor($booking): array
    {
        // Generate token konfirmasi
        $token = app(BookingController::class)->generateConfirmationToken($booking);
        $confirmUrl = url("/booking/confirm/{$token}");

        $message = "BOOKING BARU - KLINIK BUNGAS\n\n" .
            "Dokter {$booking->dokter->nm_dokter},\n\n" .
            "Ada booking baru:\n\n" .
            "Pasien: {$booking->nama}\n" .
            "Tanggal: " . $booking->tanggal->format('d/m/Y H:i') . "\n" .
            "Poli: {$booking->poliklinik->nm_poli}\n" .
            "Keluhan: {$booking->catatan}\n\n" .
            "Klik link berikut untuk MENERIMA booking:\n" .
            "{$confirmUrl}\n\n" .
            "Link berlaku 24 jam.";

        return $this->sendMessage($booking->dokter->no_telp, $message);
    }

    /**
     * Format nomor telepon ke format internasional (62xxx)
     */
    private function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }
        
        return $phone;
    }
}
```

---

## Integrasi BPJS

Project ini menggunakan API BPJS VClaim untuk validasi NIK dan mengambil data peserta.

Detail lengkap ada di file: `DOKUMENTASI_BPJS_NIK.md`

---

## Cara Menerapkan ke Project Lain

### Langkah 1: Buat Database Tables

Jalankan migration atau buat tabel secara manual sesuai schema di atas.

### Langkah 2: Buat Models

Copy dan sesuaikan model-model berikut:
- `BookingPeriksa.php`
- `RegPeriksa.php`
- `Pasien.php`
- `Dokter.php`
- `Poliklinik.php`
- `Penjab.php`

### Langkah 3: Buat Service

Copy `BookingToRegPeriksa.php` dan sesuaikan mapping field.

### Langkah 4: Buat Controller

Copy `BookingController.php` dan buat routes di `api.php`.

### Langkah 5: Buat Frontend

Buat form booking dengan field yang sesuai.

### Langkah 6: Setup WhatsApp

1. Daftar akun di Fonnte/WaBlas
2. Dapatkan API token
3. Tambahkan ke `.env`:
   ```
   WHATSAPP_URL=https://api.fonnte.com/send
   WHATSAPP_TOKEN=your_token_here
   ```

### Langkah 7: (Optional) Setup BPJS

Jika ingin integrasi BPJS, lihat `DOKUMENTASI_BPJS_NIK.md`.

---

## Troubleshooting

### Booking tidak tersimpan
- Cek validasi input
- Cek koneksi database
- Lihat log di `storage/logs/laravel.log`

### WhatsApp tidak terkirim
- Cek token API
- Cek format nomor telepon
- Lihat log WhatsApp

### Transfer ke SIMRS gagal
- Pastikan pasien sudah terdaftar di tabel `pasien`
- Pastikan status booking adalah `Diterima`
- Cek tidak ada duplikasi registrasi

---

*Dokumentasi ini dibuat pada Januari 2026 untuk Klinik Bungas*
