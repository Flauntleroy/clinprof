import { NextRequest } from 'next/server';
import { queryOne } from '@/lib/db';
import { queryOneSimrs, executeSimrs } from '@/lib/db-simrs';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Booking {
    id: string;
    nama_pasien: string;
    nik: string | null;
    alamat: string | null;
    telepon: string;
    kd_pj: string | null;
}

interface PasienSimrs {
    no_rkm_medis: string;
    nm_pasien: string;
}

// Parse NIK to extract birth date and gender
function parseNikInfo(nik: string): { tglLahir: string; jenisKelamin: 'L' | 'P' } {
    const day = parseInt(nik.substring(6, 8));
    const month = parseInt(nik.substring(8, 10));
    let year = parseInt(nik.substring(10, 12));

    const currentYear = new Date().getFullYear() % 100;
    year = year > currentYear ? 1900 + year : 2000 + year;

    const jenisKelamin: 'L' | 'P' = day > 40 ? 'P' : 'L';
    const actualDay = day > 40 ? day - 40 : day;

    const tglLahir = `${year}-${String(month).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;

    return { tglLahir, jenisKelamin };
}

// GET /api/v1/booking/[id]/patient - Check if patient exists in SIMRS
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;

        // Get booking data
        const booking = await queryOne<Booking>(
            'SELECT nama_pasien, nik, alamat, telepon, kd_pj FROM booking WHERE id = ?',
            [id]
        );

        if (!booking) {
            return errorResponse('Booking tidak ditemukan', 404);
        }

        if (!booking.nik) {
            return successResponse({
                exists: false,
                no_rkm_medis: null,
                message: 'NIK belum diisi'
            });
        }

        // Check if patient exists in SIMRS
        const pasien = await queryOneSimrs<PasienSimrs>(
            'SELECT no_rkm_medis, nm_pasien FROM pasien WHERE no_ktp = ?',
            [booking.nik]
        );

        return successResponse({
            exists: !!pasien,
            no_rkm_medis: pasien?.no_rkm_medis || null,
            nm_pasien: pasien?.nm_pasien || null
        });

    } catch (error) {
        console.error('Check patient error:', error);
        return errorResponse('Gagal cek data pasien: ' + (error as Error).message, 500);
    }
}

// POST /api/v1/booking/[id]/patient - Register patient to SIMRS
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;
        const body = await request.json();

        // Get NIK from form or booking
        const nik = body.no_ktp;
        if (!nik) {
            return errorResponse('NIK pasien belum diisi', 400);
        }

        // Check if patient already exists
        const existingPatient = await queryOneSimrs<PasienSimrs>(
            'SELECT no_rkm_medis FROM pasien WHERE no_ktp = ?',
            [nik]
        );

        if (existingPatient) {
            return successResponse({
                no_rkm_medis: existingPatient.no_rkm_medis,
                message: 'Pasien sudah terdaftar di SIMRS'
            });
        }

        // Generate new no_rkm_medis (always get latest from SIMRS)
        const lastPatient = await queryOneSimrs<{ no_rkm_medis: string }>(
            'SELECT no_rkm_medis FROM pasien ORDER BY no_rkm_medis DESC LIMIT 1'
        );
        let newRkmMedis = '000001';
        if (lastPatient) {
            newRkmMedis = String(parseInt(lastPatient.no_rkm_medis) + 1).padStart(6, '0');
        }

        // Calculate age from tgl_lahir
        const tglLahir = body.tgl_lahir || parseNikInfo(nik).tglLahir;
        const birthDate = new Date(tglLahir);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const umurStr = `${age} Th`;

        // Insert new patient to SIMRS with all required fields
        await executeSimrs(
            `INSERT INTO pasien (
                no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat,
                gol_darah, pekerjaan, stts_nikah, agama, tgl_daftar, no_tlp, umur, pnd,
                keluarga, namakeluarga, kd_pj, no_peserta, kd_kel, kd_kec, kd_kab,
                pekerjaanpj, alamatpj, kelurahanpj, kecamatanpj, kabupatenpj,
                perusahaan_pasien, suku_bangsa, bahasa_pasien, cacat_fisik, email, nip, kd_prop, propinsipj
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newRkmMedis,
                (body.nm_pasien || '').toUpperCase(),
                nik,
                body.jk || 'L',
                body.tmp_lahir || '-',
                tglLahir,
                body.nm_ibu || '-',
                body.alamat || '-',
                body.gol_darah || '-',
                body.pekerjaan || '-',
                body.stts_nikah || 'BELUM MENIKAH',
                body.agama || 'ISLAM',
                new Date().toISOString().slice(0, 10),
                body.no_tlp || '-',
                umurStr,
                body.pnd || '-',
                body.keluarga || 'DIRI SENDIRI',
                body.namakeluarga || (body.nm_pasien || '').toUpperCase(),
                body.kd_pj || 'UMU',
                '',  // no_peserta
                1,   // kd_kel (default)
                1,   // kd_kec (default)
                1,   // kd_kab (default)
                '-', // pekerjaanpj
                body.alamat || '-',  // alamatpj
                '-', // kelurahanpj
                '-', // kecamatanpj
                '-', // kabupatenpj
                '-', // perusahaan_pasien
                1,   // suku_bangsa (default)
                1,   // bahasa_pasien (default)
                1,   // cacat_fisik (default)
                '',  // email
                '',  // nip
                1,   // kd_prop (default)
                '-'  // propinsipj
            ]
        );

        console.log('Patient registered to SIMRS:', newRkmMedis, body.nm_pasien);

        return successResponse({
            no_rkm_medis: newRkmMedis,
            message: 'Pasien berhasil didaftarkan ke SIMRS'
        }, 'Pasien berhasil didaftarkan');

    } catch (error) {
        console.error('Register patient error:', error);
        return errorResponse('Gagal mendaftarkan pasien: ' + (error as Error).message, 500);
    }
}

