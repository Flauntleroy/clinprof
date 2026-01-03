import { NextRequest } from 'next/server';
import { query, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId, getPaginationParams, paginatedResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Dokter {
    id: string;
    nama: string;
    spesialisasi: string;
    foto: string | null;
    bio: string | null;
    no_str: string | null;
    is_active: boolean;
    urutan: number;
    created_at: Date;
}

interface CreateDokterBody {
    nama: string;
    spesialisasi: string;
    foto?: string;
    bio?: string;
    no_str?: string;
    urutan?: number;
}

// GET /api/v1/dokter - List all doctors
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const activeOnly = url.searchParams.get('active') !== 'false';
        const { page, perPage, offset } = getPaginationParams(url);

        // Build query
        let whereClause = '';
        const params: (string | number | boolean)[] = [];

        if (activeOnly) {
            whereClause = 'WHERE is_active = TRUE';
        }

        // Get total count
        const countResult = await query<{ total: number }>(
            `SELECT COUNT(*) as total FROM dokter ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        // Get paginated data
        const doctors = await query<Dokter & { jadwal?: string }>(
            `SELECT * FROM dokter ${whereClause} ORDER BY urutan ASC, created_at DESC LIMIT ${perPage} OFFSET ${offset}`,
            params
        );

        // Fetch schedules for these doctors
        if (doctors.length > 0) {
            const doctorIds = doctors.map(d => d.id);
            const placeholders = doctorIds.map(() => '?').join(',');
            const allSchedules = await query<{ dokter_id: string, hari: string, jam_mulai: string, jam_selesai: string }>(
                `SELECT dokter_id, hari, jam_mulai, jam_selesai 
                 FROM jadwal 
                 WHERE dokter_id IN (${placeholders}) AND is_active = TRUE 
                 ORDER BY 
                    CASE hari 
                        WHEN 'SENIN' THEN 1 
                        WHEN 'SELASA' THEN 2 
                        WHEN 'RABU' THEN 3 
                        WHEN 'KAMIS' THEN 4 
                        WHEN 'JUMAT' THEN 5 
                        WHEN 'SABTU' THEN 6 
                        WHEN 'MINGGU' THEN 7 
                    END, 
                    jam_mulai ASC`,
                doctorIds
            );

            // Group schedules by doctor and format as string
            doctors.forEach(doctor => {
                const doctorSchedules = allSchedules.filter(s => s.dokter_id === doctor.id);
                if (doctorSchedules.length > 0) {
                    // Simple format: "Sen - Sab, 08:00 - 17:00" or similar
                    // For now, let's just join them or pick the first one as representative
                    // More complex formatting can be done on frontend
                    doctor.jadwal = doctorSchedules.map(s => {
                        const day = s.hari.charAt(0) + s.hari.slice(1).toLowerCase();
                        const start = s.jam_mulai.slice(0, 5);
                        const end = s.jam_selesai.slice(0, 5);
                        return `${day}, ${start} - ${end}`;
                    }).join(' | ');
                } else {
                    doctor.jadwal = 'Jadwal belum tersedia';
                }
            });
        }

        return paginatedResponse(doctors, total, page, perPage);

    } catch (error) {
        console.error('Get doctors error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// POST /api/v1/dokter - Create new doctor
export async function POST(request: NextRequest) {
    try {
        // Check auth
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body: CreateDokterBody = await request.json();

        // Validate required fields
        const validation = validateRequired(body, ['nama', 'spesialisasi']);
        if (!validation.valid) {
            return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
        }

        const id = generateId();
        await execute(
            `INSERT INTO dokter (id, nama, spesialisasi, foto, bio, no_str, urutan) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, body.nama, body.spesialisasi, body.foto || null, body.bio || null, body.no_str || null, body.urutan || 0]
        );

        return successResponse({ id }, 'Dokter berhasil ditambahkan');

    } catch (error) {
        console.error('Create doctor error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
