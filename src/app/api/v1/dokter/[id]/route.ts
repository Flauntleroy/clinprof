import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Dokter {
    id: string;
    nama: string;
    spesialisasi: string;
    foto: string | null;
    bio: string | null;
    no_str: string | null;
    is_active: boolean;
    urutan: number;
    created_at: Date;
}

interface UpdateDokterBody {
    nama?: string;
    spesialisasi?: string;
    foto?: string;
    bio?: string;
    no_str?: string;
    is_active?: boolean;
    urutan?: number;
}

// GET /api/v1/dokter/[id] - Get single doctor
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const doctor = await queryOne<Dokter>(
            'SELECT * FROM dokter WHERE id = ?',
            [id]
        );

        if (!doctor) {
            return errorResponse('Dokter tidak ditemukan', 404);
        }

        return successResponse(doctor);

    } catch (error) {
        console.error('Get doctor error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// PUT /api/v1/dokter/[id] - Update doctor
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check auth
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;
        const body: UpdateDokterBody = await request.json();

        // Check if exists
        const existing = await queryOne<Dokter>('SELECT id FROM dokter WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Dokter tidak ditemukan', 404);
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: (string | number | boolean | null)[] = [];

        if (body.nama !== undefined) {
            updates.push('nama = ?');
            values.push(body.nama);
        }
        if (body.spesialisasi !== undefined) {
            updates.push('spesialisasi = ?');
            values.push(body.spesialisasi);
        }
        if (body.foto !== undefined) {
            updates.push('foto = ?');
            values.push(body.foto);
        }
        if (body.bio !== undefined) {
            updates.push('bio = ?');
            values.push(body.bio);
        }
        if (body.no_str !== undefined) {
            updates.push('no_str = ?');
            values.push(body.no_str);
        }
        if (body.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(body.is_active);
        }
        if (body.urutan !== undefined) {
            updates.push('urutan = ?');
            values.push(body.urutan);
        }

        if (updates.length === 0) {
            return errorResponse('Tidak ada data yang diupdate', 400);
        }

        values.push(id);
        await execute(
            `UPDATE dokter SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return successResponse({ id }, 'Dokter berhasil diupdate');

    } catch (error) {
        console.error('Update doctor error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// DELETE /api/v1/dokter/[id] - Delete doctor
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check auth
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;

        // Check if exists
        const existing = await queryOne<Dokter>('SELECT id FROM dokter WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Dokter tidak ditemukan', 404);
        }

        await execute('DELETE FROM dokter WHERE id = ?', [id]);

        return successResponse({ id }, 'Dokter berhasil dihapus');

    } catch (error) {
        console.error('Delete doctor error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
