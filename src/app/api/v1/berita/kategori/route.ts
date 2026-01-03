import { NextRequest } from 'next/server';
import { query, execute } from '@/lib/db';
import { successResponse, errorResponse, generateId } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface KategoriBerita {
    id: string;
    nama: string;
    slug: string;
    deskripsi: string | null;
    created_at: Date;
}

// GET /api/v1/berita/kategori - Get all categories
export async function GET() {
    try {
        const categories = await query<KategoriBerita>(
            'SELECT * FROM kategori_berita ORDER BY nama'
        );
        return successResponse(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// POST /api/v1/berita/kategori - Create new category
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body: { nama: string; deskripsi?: string } = await request.json();

        if (!body.nama) {
            return errorResponse('Nama kategori wajib diisi', 400);
        }

        const slug = body.nama
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        const id = generateId();
        await execute(
            'INSERT INTO kategori_berita (id, nama, slug, deskripsi) VALUES (?, ?, ?, ?)',
            [id, body.nama, slug, body.deskripsi || null]
        );

        return successResponse({ id, nama: body.nama, slug }, 'Kategori berhasil dibuat', 201);
    } catch (error) {
        console.error('Create category error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// DELETE /api/v1/berita/kategori - Delete category
export async function DELETE(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return errorResponse('ID kategori wajib diisi', 400);
        }

        await execute('DELETE FROM kategori_berita WHERE id = ?', [id]);
        return successResponse(null, 'Kategori berhasil dihapus');
    } catch (error) {
        console.error('Delete category error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
