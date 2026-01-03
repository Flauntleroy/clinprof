import { NextRequest } from 'next/server';
import { query, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId, getPaginationParams, paginatedResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Fasilitas {
    id: string;
    nama: string;
    deskripsi: string | null;
    gambar: string | null;
    foto?: string | null;
    kategori: 'FASILITAS' | 'TEKNOLOGI';
    is_active: boolean;
    urutan: number;
}

interface CreateFasilitasBody {
    nama: string;
    deskripsi?: string;
    gambar?: string;
    foto?: string;
    kategori?: 'FASILITAS' | 'TEKNOLOGI';
    urutan?: number;
}

// GET /api/v1/fasilitas
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const activeOnly = url.searchParams.get('active') !== 'false';
        const kategori = url.searchParams.get('kategori');
        const { page, perPage, offset } = getPaginationParams(url);

        const conditions: string[] = [];
        const params: (string | number | boolean)[] = [];

        if (activeOnly) {
            conditions.push('is_active = TRUE');
        }
        if (kategori) {
            conditions.push('kategori = ?');
            params.push(kategori.toUpperCase());
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await query<{ total: number }>(
            `SELECT COUNT(*) as total FROM fasilitas ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        const facilities = await query<Fasilitas>(
            `SELECT * FROM fasilitas ${whereClause} ORDER BY urutan ASC LIMIT ${perPage} OFFSET ${offset}`,
            params
        );

        // Map gambar to foto
        const mappedFacilities = facilities.map(f => ({
            ...f,
            foto: f.gambar
        }));

        return paginatedResponse(mappedFacilities, total, page, perPage);

    } catch (error) {
        console.error('Get facilities error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// POST /api/v1/fasilitas
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body: CreateFasilitasBody = await request.json();

        const validation = validateRequired(body, ['nama']);
        if (!validation.valid) {
            return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
        }

        const id = generateId();
        const gambar = body.foto || body.gambar || null;
        await execute(
            `INSERT INTO fasilitas (id, nama, deskripsi, gambar, kategori, urutan) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, body.nama, body.deskripsi || null, gambar, body.kategori || 'FASILITAS', body.urutan || 0]
        );

        return successResponse({ id }, 'Fasilitas berhasil ditambahkan');

    } catch (error) {
        console.error('Create facility error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
