import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Layanan {
    id: string;
    nama: string;
    deskripsi: string | null;
    icon: string | null;
    gambar: string | null;
    foto?: string | null;
    is_active: boolean;
    urutan: number;
}

interface UpdateLayananBody {
    nama?: string;
    deskripsi?: string;
    icon?: string;
    gambar?: string;
    foto?: string;
    is_active?: boolean;
    urutan?: number;
}

// GET /api/v1/layanan/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const service = await queryOne<Layanan>(
            'SELECT * FROM layanan WHERE id = ?',
            [id]
        );

        if (!service) {
            return errorResponse('Layanan tidak ditemukan', 404);
        }

        // Map icon to foto
        service.foto = service.icon || service.gambar;

        return successResponse(service);

    } catch (error) {
        console.error('Get service error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// PUT /api/v1/layanan/[id]
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
        const body: UpdateLayananBody = await request.json();

        const existing = await queryOne<Layanan>('SELECT id FROM layanan WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Layanan tidak ditemukan', 404);
        }

        const updates: string[] = [];
        const values: (string | number | boolean | null)[] = [];

        if (body.nama !== undefined) { updates.push('nama = ?'); values.push(body.nama); }
        if (body.deskripsi !== undefined) { updates.push('deskripsi = ?'); values.push(body.deskripsi); }

        // Handle icon/foto/gambar
        const iconValue = body.foto !== undefined ? body.foto : body.icon;
        if (iconValue !== undefined) { updates.push('icon = ?'); values.push(iconValue); }
        if (body.gambar !== undefined) { updates.push('gambar = ?'); values.push(body.gambar); }

        if (body.is_active !== undefined) { updates.push('is_active = ?'); values.push(body.is_active); }
        if (body.urutan !== undefined) { updates.push('urutan = ?'); values.push(body.urutan); }

        if (updates.length === 0) {
            return errorResponse('Tidak ada data yang diupdate', 400);
        }

        values.push(id);
        await execute(`UPDATE layanan SET ${updates.join(', ')} WHERE id = ?`, values);

        return successResponse({ id }, 'Layanan berhasil diupdate');

    } catch (error) {
        console.error('Update service error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// DELETE /api/v1/layanan/[id]
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

        const existing = await queryOne<Layanan>('SELECT id FROM layanan WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Layanan tidak ditemukan', 404);
        }

        await execute('DELETE FROM layanan WHERE id = ?', [id]);

        return successResponse({ id }, 'Layanan berhasil dihapus');

    } catch (error) {
        console.error('Delete service error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
