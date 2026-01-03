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

// Send WhatsApp message via Fonnte
export async function sendWhatsApp(params: SendWhatsAppParams): Promise<{ success: boolean; message: string }> {
    const token = process.env.FONNTE_TOKEN;

    if (!token) {
        console.error('FONNTE_TOKEN is not configured');
        return { success: false, message: 'WhatsApp service not configured' };
    }

    // Check if notifications are enabled
    const isEnabled = process.env.NOTIFIKASI_WA_AKTIF !== 'false';
    if (!isEnabled) {
        console.log('WhatsApp notifications are disabled');
        return { success: true, message: 'Notifications disabled, skipping' };
    }

    try {
        const formData = new FormData();
        formData.append('target', params.target);
        formData.append('message', params.message);

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

// Format booking confirmation message
export function formatBookingMessage(data: {
    nama: string;
    kode: string;
    tanggal: string;
    waktu: string;
    dokter: string;
    template?: string;
}): string {
    const defaultTemplate = `Halo {nama}, terima kasih telah melakukan booking di Klinik Spesialis Mata Makula Bahalap.

Detail Booking:
📋 Kode: {kode}
📅 Tanggal: {tanggal}
🕐 Waktu: {waktu}
👨‍⚕️ Dokter: {dokter}

Mohon datang 15 menit sebelum jadwal.
Terima kasih! 🙏`;

    const template = data.template || defaultTemplate;

    return template
        .replace(/{nama}/g, data.nama)
        .replace(/{kode}/g, data.kode)
        .replace(/{tanggal}/g, data.tanggal)
        .replace(/{waktu}/g, data.waktu)
        .replace(/{dokter}/g, data.dokter);
}

// Send booking confirmation
export async function sendBookingConfirmation(data: {
    telepon: string;
    nama: string;
    kode: string;
    tanggal: string;
    waktu: string;
    dokter: string;
}): Promise<{ success: boolean; message: string }> {
    const message = formatBookingMessage(data);

    // Normalize phone number (ensure starts with 62)
    let phone = data.telepon.replace(/\D/g, '');
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
        phone = '62' + phone;
    }

    return sendWhatsApp({
        target: phone,
        message,
    });
}
