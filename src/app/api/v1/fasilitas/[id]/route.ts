import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Fasilitas {
    id: string;
    nama: string;
    deskripsi: string | null;
    gambar: string | null;
    foto?: string | null;
    kategori: string;
    is_active: boolean;
    urutan: number;
}

interface UpdateFasilitasBody {
    nama?: string;
    deskripsi?: string;
    gambar?: string;
    foto?: string;
    kategori?: string;
    is_active?: boolean;
    urutan?: number;
}

// GET /api/v1/fasilitas/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const facility = await queryOne<Fasilitas>(
            'SELECT * FROM fasilitas WHERE id = ?',
            [id]
        );

        if (!facility) {
            return errorResponse('Fasilitas tidak ditemukan', 404);
        }

        // Map gambar to foto
        facility.foto = facility.gambar;

        return successResponse(facility);

    } catch (error) {
        console.error('Get facility error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// PUT /api/v1/fasilitas/[id]
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
        const body: UpdateFasilitasBody = await request.json();

        const existing = await queryOne<Fasilitas>('SELECT id FROM fasilitas WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Fasilitas tidak ditemukan', 404);
        }

        const updates: string[] = [];
        const values: (string | number | boolean | null)[] = [];

        if (body.nama !== undefined) { updates.push('nama = ?'); values.push(body.nama); }
        if (body.deskripsi !== undefined) { updates.push('deskripsi = ?'); values.push(body.deskripsi); }

        // Handle gambar/foto
        const gambarValue = body.foto !== undefined ? body.foto : body.gambar;
        if (gambarValue !== undefined) { updates.push('gambar = ?'); values.push(gambarValue); }

        if (body.kategori !== undefined) { updates.push('kategori = ?'); values.push(body.kategori); }
        if (body.is_active !== undefined) { updates.push('is_active = ?'); values.push(body.is_active); }
        if (body.urutan !== undefined) { updates.push('urutan = ?'); values.push(body.urutan); }

        if (updates.length === 0) {
            return errorResponse('Tidak ada data yang diupdate', 400);
        }

        values.push(id);
        await execute(`UPDATE fasilitas SET ${updates.join(', ')} WHERE id = ?`, values);

        return successResponse({ id }, 'Fasilitas berhasil diupdate');

    } catch (error) {
        console.error('Update facility error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// DELETE /api/v1/fasilitas/[id]
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

        const existing = await queryOne<Fasilitas>('SELECT id FROM fasilitas WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Fasilitas tidak ditemukan', 404);
        }

        await execute('DELETE FROM fasilitas WHERE id = ?', [id]);

        return successResponse({ id }, 'Fasilitas berhasil dihapus');

    } catch (error) {
        console.error('Delete facility error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
