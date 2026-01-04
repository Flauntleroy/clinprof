import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { queryOneSimrs, executeSimrs, querySimrs } from '@/lib/db-simrs';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface Booking {
    id: string;
    kode_booking: string;
    nama_pasien: string;
    nik: string | null;
    alamat: string | null;
    telepon: string;
    tanggal: string;
    waktu: string;
    dokter_id: string;
    kd_dokter_simrs: string | null;
    kd_poli: string | null;
    kd_pj: string | null;
    status: string;
}

// Parse NIK to extract birth date and gender
// NIK format: PPKKCC-DDMMYY-XXXX (16 digits)
// DD = tanggal (perempuan +40), MM = bulan, YY = tahun lahir
function parseNikInfo(nik: string): { tglLahir: string; jenisKelamin: 'L' | 'P' } {
    const day = parseInt(nik.substring(6, 8));
    const month = parseInt(nik.substring(8, 10));
    let year = parseInt(nik.substring(10, 12));

    // Determine century: if year > current year's last 2 digits, it's 1900s
    const currentYear = new Date().getFullYear() % 100;
    year = year > currentYear ? 1900 + year : 2000 + year;

    // If day > 40, it's female (subtract 40 to get actual day)
    const jenisKelamin: 'L' | 'P' = day > 40 ? 'P' : 'L';
    const actualDay = day > 40 ? day - 40 : day;

    const tglLahir = `${year}-${String(month).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;

    return { tglLahir, jenisKelamin };
}

interface PasienSimrs {
    no_rkm_medis: string;
    nm_pasien: string;
    no_ktp: string;
    tgl_lahir: string;
    alamat: string;
}

// POST /api/v1/booking/[id]/transfer - Transfer booking to SIMRS reg_periksa
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

        // 1. Get booking data
        console.log('Transfer: Getting booking', id);
        const booking = await queryOne<Booking>(
            `SELECT b.*, d.kd_dokter_simrs 
             FROM booking b 
             LEFT JOIN dokter d ON b.dokter_id = d.id 
             WHERE b.id = ?`,
            [id]
        );

        if (!booking) {
            return errorResponse('Booking tidak ditemukan', 404);
        }

        console.log('Transfer: Booking found', {
            status: booking.status,
            nik: booking.nik,
            kd_dokter_simrs: booking.kd_dokter_simrs,
            kd_poli: booking.kd_poli
        });

        // 2. Validate status
        if (booking.status !== 'CONFIRMED') {
            return errorResponse('Hanya booking dengan status CONFIRMED yang dapat ditransfer', 400);
        }

        // 3. Validate required SIMRS data
        if (!booking.nik) {
            return errorResponse('NIK pasien belum diisi, tidak dapat transfer ke SIMRS', 400);
        }

        if (!booking.kd_dokter_simrs) {
            return errorResponse('Dokter belum dimapping ke SIMRS. Mapping dokter terlebih dahulu.', 400);
        }

        if (!booking.kd_poli) {
            return errorResponse('Kode poliklinik belum diisi', 400);
        }

        // 4. Find patient in SIMRS by NIK
        console.log('Transfer: Finding patient in SIMRS with NIK', booking.nik);
        const pasien = await queryOneSimrs<PasienSimrs>(
            'SELECT no_rkm_medis, nm_pasien, no_ktp, tgl_lahir, alamat FROM pasien WHERE no_ktp = ?',
            [booking.nik]
        );

        // If patient not found, require manual registration first
        if (!pasien) {
            return errorResponse(
                `Pasien dengan NIK ${booking.nik} belum terdaftar di SIMRS. Gunakan tombol "Daftarkan ke SIMRS" di halaman detail booking untuk mendaftarkan pasien terlebih dahulu.`,
                400
            );
        }
        console.log('Transfer: Patient found', pasien.no_rkm_medis, pasien.nm_pasien);

        // 5. Check for duplicate registration
        const existingReg = await queryOneSimrs<{ no_rawat: string }>(
            `SELECT no_rawat FROM reg_periksa 
             WHERE no_rkm_medis = ? AND DATE(tgl_registrasi) = ? AND kd_poli = ?`,
            [pasien.no_rkm_medis, booking.tanggal, booking.kd_poli]
        );

        if (existingReg) {
            return errorResponse(
                `Pasien sudah terdaftar pada tanggal tersebut dengan no_rawat: ${existingReg.no_rawat}`,
                400
            );
        }

        // 6. Generate no_rawat and no_reg
        const tanggalFormatted = new Date(booking.tanggal).toISOString().slice(0, 10).replace(/-/g, '/');

        // Get last no_rawat for today
        const lastRawat = await queryOneSimrs<{ no_rawat: string }>(
            `SELECT no_rawat FROM reg_periksa WHERE no_rawat LIKE ? ORDER BY no_rawat DESC LIMIT 1`,
            [`${tanggalFormatted}%`]
        );

        let noRawatSeq = 1;
        if (lastRawat) {
            noRawatSeq = parseInt(lastRawat.no_rawat.slice(-6)) + 1;
        }
        const noRawat = `${tanggalFormatted}/${String(noRawatSeq).padStart(6, '0')}`;

        // Get last no_reg for today
        const lastReg = await queryOneSimrs<{ no_reg: string }>(
            `SELECT no_reg FROM reg_periksa WHERE DATE(tgl_registrasi) = ? ORDER BY no_reg DESC LIMIT 1`,
            [booking.tanggal]
        );

        let noRegSeq = 1;
        if (lastReg && lastReg.no_reg) {
            noRegSeq = parseInt(lastReg.no_reg) + 1;
        }
        const noReg = String(noRegSeq).padStart(3, '0');

        // 7. Calculate age
        const birthDate = new Date(pasien.tgl_lahir);
        const regDate = new Date(booking.tanggal);
        let umur = regDate.getFullYear() - birthDate.getFullYear();
        let sttsUmur = 'Th';

        if (umur === 0) {
            umur = Math.floor((regDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            sttsUmur = 'Bl';
            if (umur === 0) {
                umur = Math.floor((regDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
                sttsUmur = 'Hr';
            }
        }

        // 8. Determine status daftar (Lama/Baru)
        const existingPatientReg = await queryOneSimrs<{ no_rawat: string }>(
            'SELECT no_rawat FROM reg_periksa WHERE no_rkm_medis = ? LIMIT 1',
            [pasien.no_rkm_medis]
        );
        const sttsDaftar = existingPatientReg ? 'Lama' : 'Baru';

        // 9. Determine status poli (Lama/Baru)
        const existingPoliReg = await queryOneSimrs<{ no_rawat: string }>(
            'SELECT no_rawat FROM reg_periksa WHERE no_rkm_medis = ? AND kd_poli = ? LIMIT 1',
            [pasien.no_rkm_medis, booking.kd_poli]
        );
        const statusPoli = existingPoliReg ? 'Lama' : 'Baru';

        // 10. Insert into reg_periksa
        await executeSimrs(
            `INSERT INTO reg_periksa (
                no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli,
                p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut,
                kd_pj, umurdaftar, sttsumur, status_bayar, status_poli
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                noReg,
                noRawat,
                booking.tanggal,
                booking.waktu.length === 5 ? `${booking.waktu}:00` : booking.waktu.slice(0, 8),
                booking.kd_dokter_simrs,
                pasien.no_rkm_medis,
                booking.kd_poli,
                pasien.nm_pasien,
                pasien.alamat || '',
                'DIRI SENDIRI',
                0,
                'Belum',
                sttsDaftar,
                'Ralan',
                booking.kd_pj || 'UMU',
                umur,
                sttsUmur,
                'Belum Bayar',
                statusPoli
            ]
        );

        // 11. Update booking status
        await execute(
            'UPDATE booking SET status = ? WHERE id = ?',
            ['COMPLETED', id]
        );

        return successResponse({
            no_rawat: noRawat,
            no_reg: noReg,
            no_rkm_medis: pasien.no_rkm_medis,
            nama_pasien: pasien.nm_pasien
        }, 'Booking berhasil ditransfer ke SIMRS');

    } catch (error) {
        console.error('Transfer booking error:', error);
        return errorResponse('Gagal transfer booking ke SIMRS: ' + (error as Error).message, 500);
    }
}
