import { NextRequest } from 'next/server';
import { query, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Jadwal {
    id: string;
    dokter_id: string;
    nama_dokter?: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    is_active: boolean;
    created_at: Date;
}

interface CreateJadwalBody {
    dokter_id: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    is_active?: boolean;
}

// GET /api/v1/jadwal - List all schedules
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const dokterId = url.searchParams.get('dokter_id');
        const activeOnly = url.searchParams.get('active') !== 'false';

        let whereClause = '';
        const params: any[] = [];

        if (dokterId) {
            whereClause = 'WHERE j.dokter_id = ?';
            params.push(dokterId);
        }

        if (activeOnly) {
            whereClause += whereClause ? ' AND j.is_active = TRUE' : 'WHERE j.is_active = TRUE';
        }

        const schedules = await query<Jadwal>(
            `SELECT j.*, d.nama as nama_dokter 
             FROM jadwal j 
             JOIN dokter d ON j.dokter_id = d.id 
             ${whereClause} 
             ORDER BY 
                CASE j.hari 
                    WHEN 'SENIN' THEN 1 
                    WHEN 'SELASA' THEN 2 
                    WHEN 'RABU' THEN 3 
                    WHEN 'KAMIS' THEN 4 
                    WHEN 'JUMAT' THEN 5 
                    WHEN 'SABTU' THEN 6 
                    WHEN 'MINGGU' THEN 7 
                END, 
                j.jam_mulai ASC`,
            params
        );

        return successResponse(schedules);

    } catch (error) {
        console.error('Get schedules error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// POST /api/v1/jadwal - Create new schedule
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body: CreateJadwalBody = await request.json();

        const validation = validateRequired(body, ['dokter_id', 'hari', 'jam_mulai', 'jam_selesai']);
        if (!validation.valid) {
            return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
        }

        const id = generateId();
        await execute(
            `INSERT INTO jadwal (id, dokter_id, hari, jam_mulai, jam_selesai, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                body.dokter_id,
                body.hari.toUpperCase(),
                body.jam_mulai,
                body.jam_selesai,
                body.is_active ?? true
            ]
        );

        return successResponse({ id }, 'Jadwal berhasil ditambahkan');

    } catch (error) {
        console.error('Create schedule error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
