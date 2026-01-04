import { queryOne } from './db';

const FONNTE_API_URL = 'https://api.fonnte.com/send';

interface SendWhatsAppParams {
    target: string;
    message: string;
}

interface FonnteResponse {
    status: boolean;
    detail?: string;
    reason?: string;
}

interface BookingData {
    telepon: string;
    nama: string;
    kode: string;
    tanggal: string;
    waktu: string;
    dokter: string;
    poliklinik?: string;
    alamatKlinik?: string;
    nik?: string;
    keluhan?: string;
}


// Send WhatsApp message via Fonnte
export async function sendWhatsApp(params: SendWhatsAppParams): Promise<{ success: boolean; message: string }> {
    // Fetch settings from database
    let token = '';
    let isEnabled = true;
    let device = '';

    try {
        const settings = await queryOne<{ nilai: string | Record<string, any> }>(
            "SELECT nilai FROM konten_website WHERE kunci = 'whatsapp'"
        );

        if (settings) {
            const val = typeof settings.nilai === 'string' ? JSON.parse(settings.nilai) : settings.nilai;
            token = val.fonnte_token;
            isEnabled = val.notifikasi_wa_aktif !== 'false' && val.notifikasi_wa_aktif !== false;
            device = val.fonnte_device || '';
        }
    } catch (err) {
        console.error('Failed to fetch WhatsApp settings from DB:', err);
    }

    // Fallback to env for safety or if not in DB yet
    if (!token) token = process.env.FONNTE_TOKEN || '';

    if (!token) {
        console.error('WhatsApp token not found in DB or ENV');
        return { success: false, message: 'WhatsApp service not configured' };
    }

    if (!isEnabled) {
        console.log('WhatsApp notifications are disabled');
        return { success: true, message: 'Notifications disabled, skipping' };
    }

    try {
        const formData = new FormData();
        formData.append('target', params.target);
        formData.append('message', params.message);
        if (device) {
            formData.append('device', device);
        }

        const response = await fetch(FONNTE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': token,
            },
            body: formData,
        });

        const data: FonnteResponse = await response.json();

        if (data.status) {
            return { success: true, message: 'Message sent successfully' };
        } else {
            return { success: false, message: data.reason || 'Failed to send message' };
        }
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        return { success: false, message: 'Failed to send WhatsApp message' };
    }
}

// Normalize phone number to international format
function normalizePhone(telepon: string): string {
    let phone = telepon.replace(/\D/g, '');
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
        phone = '62' + phone;
    }
    return phone;
}

// Get clinic info from database
async function getClinicInfo(): Promise<{ nama: string; alamat: string }> {
    try {
        const settings = await queryOne<{ nilai: string | Record<string, any> }>(
            "SELECT nilai FROM konten_website WHERE kunci = 'profil'"
        );
        if (settings) {
            const val = typeof settings.nilai === 'string' ? JSON.parse(settings.nilai) : settings.nilai;
            return {
                nama: val.nama_klinik || 'Klinik Spesialis Mata Makula Bahalap',
                alamat: val.alamat || ''
            };
        }
    } catch (err) {
        console.error('Failed to fetch clinic info:', err);
    }
    return { nama: 'Klinik Spesialis Mata Makula Bahalap', alamat: '' };
}

// =====================================================
// Template 1: Notifikasi saat BOOKING DIBUAT (PENDING)
// =====================================================
export async function sendBookingCreatedNotification(data: BookingData): Promise<{ success: boolean; message: string }> {
    const clinic = await getClinicInfo();

    const message = `*KONFIRMASI BOOKING ${clinic.nama.toUpperCase()}*

Halo ${data.nama},

Booking Anda telah berhasil diterima dengan detail:

*No. Booking:* ${data.kode}
*Nama:* ${data.nama}
*Tanggal:* ${data.tanggal} Pukul ${data.waktu} WITA
*Dokter:* ${data.dokter}
*Status:* Menunggu Konfirmasi

Kami akan segera menghubungi Anda untuk konfirmasi booking.

Terima kasih telah mempercayai ${clinic.nama}! 🙏`;

    return sendWhatsApp({
        target: normalizePhone(data.telepon),
        message,
    });
}

// =====================================================
// Template 2: Notifikasi saat BOOKING DIKONFIRMASI
// =====================================================
export async function sendBookingConfirmedNotification(data: BookingData): Promise<{ success: boolean; message: string }> {
    const clinic = await getClinicInfo();

    const message = `*BOOKING DITERIMA*

Halo ${data.nama},

Kabar baik! Booking Anda telah *DITERIMA* oleh dokter.

*Detail Booking:*
📋 *No. Booking:* ${data.kode}
👤 *Nama:* ${data.nama}
📅 *Tanggal:* ${data.tanggal} Pukul ${data.waktu} WITA
👨‍⚕️ *Dokter:* ${data.dokter}
🏥 *Poliklinik:* ${data.poliklinik || 'Poli Umum'}
✅ *Status:* DITERIMA

📍 *Alamat Klinik:*
${data.alamatKlinik || clinic.alamat || 'Hubungi kami untuk alamat lengkap'}

⏰ *Harap datang 15 menit sebelum jadwal*
📄 *Bawa dokumen:* KTP, Kartu BPJS (jika ada)

Jika ada pertanyaan, silakan hubungi kami.

Terima kasih telah mempercayai ${clinic.nama}! 🙏

_Pesan otomatis dari Sistem Klinik_`;

    return sendWhatsApp({
        target: normalizePhone(data.telepon),
        message,
    });
}

// =====================================================
// Legacy function (backwards compatibility)
// =====================================================
export async function sendBookingConfirmation(data: BookingData): Promise<{ success: boolean; message: string }> {
    // This is called when booking is first created (PENDING status)
    return sendBookingCreatedNotification(data);
}

// =====================================================
// Template 3: Notifikasi ke ADMIN saat ada booking baru
// =====================================================
export async function sendBookingNotificationToAdmin(data: BookingData & { adminPhone: string }): Promise<{ success: boolean; message: string }> {
    const clinic = await getClinicInfo();

    const message = `*BOOKING BARU - ${clinic.nama.toUpperCase()}*

Ada booking baru yang perlu dikonfirmasi:

*No. Booking:* ${data.kode}
*Nama Pasien:* ${data.nama}
*NIK:* ${data.nik || 'Belum diisi'}
*Telepon:* ${data.telepon}
*Tanggal:* ${data.tanggal} Pukul ${data.waktu} WITA
*Dokter:* ${data.dokter}
*Keluhan:* ${data.keluhan || '-'}

Silakan buka dashboard untuk konfirmasi booking ini.

_Pesan otomatis dari Sistem Klinik_`;

    return sendWhatsApp({
        target: normalizePhone(data.adminPhone),
        message,
    });
}

// Helper to get admin phone from database
export async function getAdminPhone(): Promise<string | null> {
    try {
        const settings = await queryOne<{ nilai: string | Record<string, any> }>(
            "SELECT nilai FROM konten_website WHERE kunci = 'whatsapp'"
        );
        if (settings) {
            const val = typeof settings.nilai === 'string' ? JSON.parse(settings.nilai) : settings.nilai;
            return val.admin_phone || val.nomor_admin || null;
        }
    } catch (err) {
        console.error('Failed to fetch admin phone:', err);
    }
    return null;
}

