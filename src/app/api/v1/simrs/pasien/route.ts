import { NextRequest } from 'next/server';
import { querySimrs, queryOneSimrs } from '@/lib/db-simrs';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api';

interface PasienSimrs {
    no_rkm_medis: string;
    nm_pasien: string;
    no_ktp: string | null;
    jk: 'L' | 'P';
    tmp_lahir: string | null;
    tgl_lahir: string;
    alamat: string | null;
    no_tlp: string | null;
    no_peserta: string | null;
    email: string | null;
}

// GET /api/v1/simrs/pasien - Search/list patients from SIMRS
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const nik = url.searchParams.get('nik');
        const nama = url.searchParams.get('nama');
        const noRm = url.searchParams.get('no_rm');
        const { page, perPage, offset } = getPaginationParams(url);

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (nik) {
            conditions.push('no_ktp = ?');
            params.push(nik);
        }
        if (nama) {
            conditions.push('nm_pasien LIKE ?');
            params.push(`%${nama}%`);
        }
        if (noRm) {
            conditions.push('no_rkm_medis = ?');
            params.push(noRm);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await querySimrs<{ total: number }>(
            `SELECT COUNT(*) as total FROM pasien ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        // Get paginated data
        const patients = await querySimrs<PasienSimrs>(
            `SELECT no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, alamat, no_tlp, no_peserta, email 
             FROM pasien ${whereClause} 
             ORDER BY nm_pasien ASC 
             LIMIT ${perPage} OFFSET ${offset}`,
            params
        );

        // Map to frontend-friendly format
        const items = patients.map(p => ({
            no_rkm_medis: p.no_rkm_medis,
            nama: p.nm_pasien,
            nik: p.no_ktp,
            jenis_kelamin: p.jk,
            tempat_lahir: p.tmp_lahir,
            tanggal_lahir: p.tgl_lahir,
            alamat: p.alamat,
            telepon: p.no_tlp,
            no_bpjs: p.no_peserta,
            email: p.email,
        }));

        return paginatedResponse(items, total, page, perPage);

    } catch (error) {
        console.error('Get SIMRS patients error:', error);
        return errorResponse('Gagal mengambil data pasien dari SIMRS', 500);
    }
}
