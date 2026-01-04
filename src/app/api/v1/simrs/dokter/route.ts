import { NextRequest } from 'next/server';
import { querySimrs } from '@/lib/db-simrs';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api';

interface DokterSimrs {
    kd_dokter: string;
    nm_dokter: string;
    jk: 'L' | 'P';
    no_telp: string | null;
    kd_sps: string | null;
    status: '1' | '0';
}

// GET /api/v1/simrs/dokter - List doctors from SIMRS
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
            `SELECT COUNT(*) as total FROM dokter ${whereClause}`
        );
        const total = countResult[0]?.total || 0;

        // Get paginated data
        const doctors = await querySimrs<DokterSimrs>(
            `SELECT kd_dokter, nm_dokter, jk, no_telp, kd_sps, status 
             FROM dokter ${whereClause} 
             ORDER BY nm_dokter ASC 
             LIMIT ${perPage} OFFSET ${offset}`
        );

        // Map to frontend-friendly format
        const items = doctors.map(d => ({
            id: d.kd_dokter,
            kd_dokter: d.kd_dokter,
            nama: d.nm_dokter,
            jenis_kelamin: d.jk,
            telepon: d.no_telp,
            is_active: d.status === '1',
        }));

        return paginatedResponse(items, total, page, perPage);

    } catch (error) {
        console.error('Get SIMRS doctors error:', error);
        return errorResponse('Gagal mengambil data dokter dari SIMRS', 500);
    }
}
