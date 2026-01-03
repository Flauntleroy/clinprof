import { NextRequest } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse, generateId } from '@/lib/api';
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

// GET /api/v1/berita - Get all berita with filters
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const kategori = url.searchParams.get('kategori');
        const search = url.searchParams.get('search');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;
        const publicOnly = url.searchParams.get('public') === 'true';

        let whereClause = 'WHERE 1=1';
        const params: (string | number)[] = [];

        if (publicOnly) {
            // Show published berita where published_at is NULL (immediate) or published_at <= NOW()
            whereClause += ' AND b.status = "published" AND (b.published_at IS NULL OR b.published_at <= NOW())';
        } else if (status && status !== 'all') {
            whereClause += ' AND b.status = ?';
            params.push(status);
        }

        if (kategori) {
            whereClause += ' AND b.kategori_id = ?';
            params.push(kategori);
        }

        if (search) {
            whereClause += ' AND (b.judul LIKE ? OR b.excerpt LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Get total count
        const countResult = await queryOne<{ total: number }>(
            `SELECT COUNT(*) as total FROM berita b ${whereClause}`,
            params
        );
        const total = countResult?.total || 0;

        // Get berita with pagination - use string interpolation for LIMIT/OFFSET
        // mysql2 execute() has issues with integer params for LIMIT/OFFSET
        const berita = await query<Berita>(
            `SELECT b.*, k.nama as kategori_nama, u.nama as author_nama
             FROM berita b
             LEFT JOIN kategori_berita k ON b.kategori_id = k.id
             LEFT JOIN users u ON b.author_id = u.id
             ${whereClause}
             ORDER BY b.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        return successResponse({
            items: berita,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get berita error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(`Terjadi kesalahan server: ${errorMessage}`, 500);
    }
}

// POST /api/v1/berita - Create new berita
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body: {
            judul: string;
            excerpt?: string;
            konten?: string;
            thumbnail?: string;
            kategori_id?: string;
            status?: 'draft' | 'published' | 'scheduled';
            published_at?: string;
            meta_title?: string;
            meta_description?: string;
        } = await request.json();

        if (!body.judul) {
            return errorResponse('Judul wajib diisi', 400);
        }

        // Generate slug from title
        let slug = body.judul
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        // Check for unique slug
        const existingSlug = await queryOne<{ id: string }>(
            'SELECT id FROM berita WHERE slug = ?',
            [slug]
        );
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        const id = generateId();
        await execute(
            `INSERT INTO berita (id, judul, slug, excerpt, konten, thumbnail, kategori_id, author_id, status, published_at, meta_title, meta_description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                body.judul,
                slug,
                body.excerpt || null,
                body.konten || null,
                body.thumbnail || null,
                body.kategori_id || null,
                authResult.user.id,
                body.status || 'draft',
                body.published_at || null,
                body.meta_title || null,
                body.meta_description || null,
            ]
        );

        return successResponse({ id, slug }, 'Berita berhasil dibuat', 201);
    } catch (error) {
        console.error('Create berita error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
