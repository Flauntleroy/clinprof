import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { sendBookingConfirmedNotification } from '@/lib/whatsapp';

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
    status: string;
    catatan_admin: string | null;
    notifikasi_terkirim: boolean;
    created_at: Date;
}

interface UpdateBookingBody {
    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    catatan_admin?: string;
    tanggal?: string;
    waktu?: string;
    nik?: string;
    alamat?: string;
}

// GET /api/v1/booking/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const booking = await queryOne<Booking>(
            `SELECT b.*, d.nama as dokter_nama 
       FROM booking b 
       LEFT JOIN dokter d ON b.dokter_id = d.id 
       WHERE b.id = ? OR b.kode_booking = ?`,
            [id, id]
        );

        if (!booking) {
            return errorResponse('Booking tidak ditemukan', 404);
        }

        return successResponse(booking);

    } catch (error) {
        console.error('Get booking error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// PUT /api/v1/booking/[id] - Update booking (admin)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;
        const body: UpdateBookingBody = await request.json();

        // Get existing booking with doctor info
        const existing = await queryOne<Booking>(
            `SELECT b.*, d.nama as dokter_nama 
             FROM booking b 
             LEFT JOIN dokter d ON b.dokter_id = d.id 
             WHERE b.id = ?`,
            [id]
        );
        if (!existing) {
            return errorResponse('Booking tidak ditemukan', 404);
        }

        const updates: string[] = [];
        const values: (string | boolean | null)[] = [];

        if (body.status !== undefined) { updates.push('status = ?'); values.push(body.status); }
        if (body.catatan_admin !== undefined) { updates.push('catatan_admin = ?'); values.push(body.catatan_admin); }
        if (body.tanggal !== undefined) { updates.push('tanggal = ?'); values.push(body.tanggal); }
        if (body.waktu !== undefined) { updates.push('waktu = ?'); values.push(body.waktu); }
        if (body.nik !== undefined) { updates.push('nik = ?'); values.push(body.nik); }
        if (body.alamat !== undefined) { updates.push('alamat = ?'); values.push(body.alamat); }

        if (updates.length === 0) {
            return errorResponse('Tidak ada data yang diupdate', 400);
        }

        values.push(id);
        await execute(`UPDATE booking SET ${updates.join(', ')} WHERE id = ?`, values);

        // Send WhatsApp notification when status changes to CONFIRMED
        let notificationSent = false;
        if (body.status === 'CONFIRMED' && existing.status !== 'CONFIRMED') {
            const tanggalFormatted = new Date(body.tanggal || existing.tanggal).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const waResult = await sendBookingConfirmedNotification({
                telepon: existing.telepon,
                nama: existing.nama_pasien,
                kode: existing.kode_booking,
                tanggal: tanggalFormatted,
                waktu: body.waktu || existing.waktu,
                dokter: existing.dokter_nama || 'Dokter',
            });

            notificationSent = waResult.success;
            console.log('WhatsApp confirmation notification:', waResult.message);
        }

        return successResponse({ id, notificationSent }, 'Booking berhasil diupdate');

    } catch (error) {
        console.error('Update booking error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}


// DELETE /api/v1/booking/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;

        const existing = await queryOne<Booking>('SELECT id FROM booking WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Booking tidak ditemukan', 404);
        }

        await execute('DELETE FROM booking WHERE id = ?', [id]);

        return successResponse({ id }, 'Booking berhasil dihapus');

    } catch (error) {
        console.error('Delete booking error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
