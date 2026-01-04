import { NextRequest } from 'next/server';
import { querySimrs } from '@/lib/db-simrs';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api';

interface PoliklinikSimrs {
    kd_poli: string;
    nm_poli: string;
    registrasi: number;
    registrasilama: number;
    status: '1' | '0';
}

// GET /api/v1/simrs/poliklinik - List poliklinik from SIMRS
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const activeOnly = url.searchParams.get('active') !== 'false';
        const { page, perPage, offset } = getPaginationParams(url);

        let whereClause = '';
        if (activeOnly) {
            whereClause = "WHERE status = '1'";
        }

        // Get total count
        const countResult = await querySimrs<{ total: number }>(
            `SELECT COUNT(*) as total FROM poliklinik ${whereClause}`
        );
        const total = countResult[0]?.total || 0;

        // Get paginated data
        const polis = await querySimrs<PoliklinikSimrs>(
            `SELECT kd_poli, nm_poli, registrasi, registrasilama, status 
             FROM poliklinik ${whereClause} 
             ORDER BY nm_poli ASC 
             LIMIT ${perPage} OFFSET ${offset}`
        );

        // Map to frontend-friendly format
        const items = polis.map(p => ({
            id: p.kd_poli,
            kd_poli: p.kd_poli,
            nama: p.nm_poli,
            biaya_registrasi: p.registrasi,
            biaya_registrasi_lama: p.registrasilama,
            is_active: p.status === '1',
        }));

        return paginatedResponse(items, total, page, perPage);

    } catch (error) {
        console.error('Get SIMRS poliklinik error:', error);
        return errorResponse('Gagal mengambil data poliklinik dari SIMRS', 500);
    }
}
