import { NextRequest } from 'next/server';
import { query, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId, getPaginationParams, paginatedResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Layanan {
    id: string;
    nama: string;
    deskripsi: string | null;
    icon: string | null;
    gambar: string | null;
    foto?: string | null; // Alias for icon/gambar
    is_active: boolean;
    urutan: number;
}

interface CreateLayananBody {
    nama: string;
    deskripsi?: string;
    icon?: string;
    gambar?: string;
    foto?: string;
    urutan?: number;
}

// GET /api/v1/layanan - List all services
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const activeOnly = url.searchParams.get('active') !== 'false';
        const { page, perPage, offset } = getPaginationParams(url);

        let whereClause = '';
        const params: (string | number | boolean)[] = [];

        if (activeOnly) {
            whereClause = 'WHERE is_active = TRUE';
        }

        const countResult = await query<{ total: number }>(
            `SELECT COUNT(*) as total FROM layanan ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        const services = await query<Layanan>(
            `SELECT * FROM layanan ${whereClause} ORDER BY urutan ASC LIMIT ${perPage} OFFSET ${offset}`,
            params
        );

        // Map icon/gambar to foto for frontend consistency
        const mappedServices = services.map(s => ({
            ...s,
            foto: s.icon || s.gambar
        }));

        return paginatedResponse(mappedServices, total, page, perPage);

    } catch (error) {
        console.error('Get services error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// POST /api/v1/layanan - Create new service
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body: CreateLayananBody = await request.json();

        const validation = validateRequired(body, ['nama']);
        if (!validation.valid) {
            return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
        }

        const id = generateId();
        const icon = body.foto || body.icon || null;
        await execute(
            `INSERT INTO layanan (id, nama, deskripsi, icon, gambar, urutan) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, body.nama, body.deskripsi || null, icon, body.gambar || null, body.urutan || 0]
        );

        return successResponse({ id }, 'Layanan berhasil ditambahkan');

    } catch (error) {
        console.error('Create service error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
