import { NextRequest } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId, getPaginationParams, paginatedResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { sendBookingConfirmation, sendBookingNotificationToAdmin, getAdminPhone } from '@/lib/whatsapp';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

interface Booking {
    id: string;
    kode_booking: string;
    nama_pasien: string;
    telepon: string;
    email: string | null;
    tanggal: string;
    waktu: string;
    dokter_id: string;
    dokter_nama?: string;
    keluhan: string | null;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    catatan_admin: string | null;
    notifikasi_terkirim: boolean;
    created_at: Date;
}

interface CreateBookingBody {
    nama_pasien: string;
    telepon: string;
    email?: string;
    tanggal: string;
    waktu: string;
    dokter_id: string;
    keluhan?: string;
    // SIMRS Integration fields
    nik?: string;
    nomor_kartu?: string;
    alamat?: string;
    kd_poli?: string;
    kd_pj?: string;
}

// Generate booking code
function generateBookingCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `MB-${dateStr}-${random}`;
}

// GET /api/v1/booking - List all bookings (admin)
export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const tanggal = url.searchParams.get('tanggal');
        const dokterId = url.searchParams.get('dokter_id');
        const { page, perPage, offset } = getPaginationParams(url);

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (status) {
            conditions.push('b.status = ?');
            params.push(status.toUpperCase());
        }
        if (tanggal) {
            conditions.push('b.tanggal = ?');
            params.push(tanggal);
        }
        if (dokterId) {
            conditions.push('b.dokter_id = ?');
            params.push(dokterId);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await query<{ total: number }>(
            `SELECT COUNT(*) as total FROM booking b ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        const bookings = await query<Booking>(
            `SELECT b.*, d.nama as dokter_nama 
       FROM booking b 
       LEFT JOIN dokter d ON b.dokter_id = d.id 
       ${whereClause} 
       ORDER BY b.tanggal DESC, b.waktu DESC 
       LIMIT ${perPage} OFFSET ${offset}`,
            params
        );

        return paginatedResponse(bookings, total, page, perPage);

    } catch (error) {
        console.error('Get bookings error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// POST /api/v1/booking - Create new booking (public)
export async function POST(request: NextRequest) {
    try {
        // Rate limiting: max 5 bookings per IP per minute
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`booking:${clientIP}`, {
            maxRequests: 5,
            windowMs: 60000, // 1 minute
        });

        if (!rateLimit.allowed) {
            return errorResponse('Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.', 429);
        }

        const body: CreateBookingBody = await request.json();

        // Validate required fields
        const validation = validateRequired(body, ['nama_pasien', 'telepon', 'tanggal', 'waktu', 'dokter_id']);
        if (!validation.valid) {
            return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
        }

        // Check if doctor exists
        const dokter = await queryOne<{ id: string; nama: string }>(
            'SELECT id, nama FROM dokter WHERE id = ? AND is_active = TRUE',
            [body.dokter_id]
        );
        if (!dokter) {
            return errorResponse('Dokter tidak ditemukan atau tidak aktif', 400);
        }

        // Check for duplicate booking (same patient, date, doctor)
        const existing = await queryOne<{ id: string }>(
            `SELECT id FROM booking 
       WHERE telepon = ? AND tanggal = ? AND dokter_id = ? AND status != 'CANCELLED'`,
            [body.telepon, body.tanggal, body.dokter_id]
        );
        if (existing) {
            return errorResponse('Anda sudah memiliki booking pada tanggal dan dokter yang sama', 400);
        }

        const id = generateId();
        const kodeBooking = generateBookingCode();

        await execute(
            `INSERT INTO booking (id, kode_booking, nama_pasien, nik, nomor_kartu, alamat, telepon, email, tanggal, waktu, dokter_id, kd_poli, kd_pj, keluhan) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                kodeBooking,
                body.nama_pasien,
                body.nik || null,
                body.nomor_kartu || null,
                body.alamat || null,
                body.telepon,
                body.email || null,
                body.tanggal,
                body.waktu,
                body.dokter_id,
                body.kd_poli || null,
                body.kd_pj || 'UMU',
                body.keluhan || null
            ]
        );

        // Send WhatsApp notification to patient
        const tanggalFormatted = new Date(body.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const waResult = await sendBookingConfirmation({
            telepon: body.telepon,
            nama: body.nama_pasien,
            kode: kodeBooking,
            tanggal: tanggalFormatted,
            waktu: body.waktu,
            dokter: dokter.nama,
        });

        // Update notification status
        if (waResult.success) {
            await execute('UPDATE booking SET notifikasi_terkirim = TRUE WHERE id = ?', [id]);
        }

        // Send WhatsApp notification to admin
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

    } catch (error) {
        console.error('Create booking error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
