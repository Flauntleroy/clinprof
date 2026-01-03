import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Berita {
    id: string;
    judul: string;
    slug: string;
    excerpt: string | null;
    konten: string | null;
    thumbnail: string | null;
    kategori_id: string | null;
    kategori_nama?: string;
    author_id: string | null;
    author_nama?: string;
    status: 'draft' | 'published' | 'scheduled';
    views: number;
    published_at: Date | null;
    meta_title: string | null;
    meta_description: string | null;
    created_at: Date;
    updated_at: Date;
}

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/v1/berita/[id] - Get single berita
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const url = new URL(request.url);
        const incrementView = url.searchParams.get('view') === 'true';

        // Check if id is slug or actual id
        const isSlug = !id.includes('-') || id.length > 36;
        const whereClause = isSlug ? 'b.slug = ?' : 'b.id = ?';

        const berita = await queryOne<Berita>(
            `SELECT b.*, k.nama as kategori_nama, u.nama as author_nama
             FROM berita b
             LEFT JOIN kategori_berita k ON b.kategori_id = k.id
             LEFT JOIN users u ON b.author_id = u.id
             WHERE ${whereClause}`,
            [id]
        );

        if (!berita) {
            return errorResponse('Berita tidak ditemukan', 404);
        }

        // Increment view count if requested (for public page views)
        if (incrementView) {
            await execute('UPDATE berita SET views = views + 1 WHERE id = ?', [berita.id]);
            berita.views += 1;
        }

        return successResponse(berita);
    } catch (error) {
        console.error('Get berita error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// PUT /api/v1/berita/[id] - Update berita
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await context.params;

        const existing = await queryOne<{ id: string }>('SELECT id FROM berita WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Berita tidak ditemukan', 404);
        }

        const body: {
            judul?: string;
            excerpt?: string;
            konten?: string;
            thumbnail?: string;
            kategori_id?: string | null;
            status?: 'draft' | 'published' | 'scheduled';
            published_at?: string | null;
            meta_title?: string;
            meta_description?: string;
        } = await request.json();

        const updates: string[] = [];
        const params: (string | null)[] = [];

        if (body.judul !== undefined) {
            updates.push('judul = ?');
            params.push(body.judul);

            // Update slug if title changed
            let slug = body.judul
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            const existingSlug = await queryOne<{ id: string }>(
                'SELECT id FROM berita WHERE slug = ? AND id != ?',
                [slug, id]
            );
            if (existingSlug) {
                slug = `${slug}-${Date.now()}`;
            }
            updates.push('slug = ?');
            params.push(slug);
        }

        if (body.excerpt !== undefined) {
            updates.push('excerpt = ?');
            params.push(body.excerpt || null);
        }

        if (body.konten !== undefined) {
            updates.push('konten = ?');
            params.push(body.konten || null);
        }

        if (body.thumbnail !== undefined) {
            updates.push('thumbnail = ?');
            params.push(body.thumbnail || null);
        }

        if (body.kategori_id !== undefined) {
            updates.push('kategori_id = ?');
            params.push(body.kategori_id || null);
        }

        if (body.status !== undefined) {
            updates.push('status = ?');
            params.push(body.status);
        }

        if (body.published_at !== undefined) {
            updates.push('published_at = ?');
            params.push(body.published_at || null);
        }

        if (body.meta_title !== undefined) {
            updates.push('meta_title = ?');
            params.push(body.meta_title || null);
        }

        if (body.meta_description !== undefined) {
            updates.push('meta_description = ?');
            params.push(body.meta_description || null);
        }

        if (updates.length === 0) {
            return errorResponse('Tidak ada data yang diupdate', 400);
        }

        await execute(
            `UPDATE berita SET ${updates.join(', ')} WHERE id = ?`,
            [...params, id]
        );

        return successResponse({ id }, 'Berita berhasil diupdate');
    } catch (error) {
        console.error('Update berita error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// DELETE /api/v1/berita/[id] - Delete berita
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await context.params;

        const existing = await queryOne<{ id: string }>('SELECT id FROM berita WHERE id = ?', [id]);
        if (!existing) {
            return errorResponse('Berita tidak ditemukan', 404);
        }

        await execute('DELETE FROM berita WHERE id = ?', [id]);

        return successResponse(null, 'Berita berhasil dihapus');
    } catch (error) {
        console.error('Delete berita error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
