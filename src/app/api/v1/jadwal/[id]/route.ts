import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface UpdateJadwalBody {
    dokter_id?: string;
    hari?: string;
    jam_mulai?: string;
    jam_selesai?: string;
    is_active?: boolean;
}

// GET /api/v1/jadwal/[id] - Get single schedule
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const schedule = await queryOne(
            'SELECT j.*, d.nama as nama_dokter FROM jadwal j JOIN dokter d ON j.dokter_id = d.id WHERE j.id = ?',
            [id]
        );

        if (!schedule) {
            return errorResponse('Jadwal tidak ditemukan', 404);
        }

        return successResponse(schedule);

    } catch (error) {
        console.error('Get schedule error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// PUT /api/v1/jadwal/[id] - Update schedule
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
        const body: UpdateJadwalBody = await request.json();

        const existing = await queryOne('SELECT id FROM jadwal WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Jadwal tidak ditemukan', 404);
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (body.dokter_id !== undefined) {
            updates.push('dokter_id = ?');
            values.push(body.dokter_id);
        }
        if (body.hari !== undefined) {
            updates.push('hari = ?');
            values.push(body.hari.toUpperCase());
        }
        if (body.jam_mulai !== undefined) {
            updates.push('jam_mulai = ?');
            values.push(body.jam_mulai);
        }
        if (body.jam_selesai !== undefined) {
            updates.push('jam_selesai = ?');
            values.push(body.jam_selesai);
        }
        if (body.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(body.is_active);
        }

        if (updates.length === 0) {
            return errorResponse('Tidak ada data yang diupdate', 400);
        }

        values.push(id);
        await execute(
            `UPDATE jadwal SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return successResponse({ id }, 'Jadwal berhasil diupdate');

    } catch (error) {
        console.error('Update schedule error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// DELETE /api/v1/jadwal/[id] - Delete schedule
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

        const existing = await queryOne('SELECT id FROM jadwal WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Jadwal tidak ditemukan', 404);
        }

        await execute('DELETE FROM jadwal WHERE id = ?', [id]);

        return successResponse({ id }, 'Jadwal berhasil dihapus');

    } catch (error) {
        console.error('Delete schedule error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
