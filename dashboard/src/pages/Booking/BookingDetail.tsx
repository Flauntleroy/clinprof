import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPut, apiPost } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import PatientRegistrationModal from "../../components/PatientRegistrationModal";

interface Booking {
    id: string;
    kode_booking: string;
    nama_pasien: string;
    nik: string | null;
    alamat: string | null;
    telepon: string;
    email: string | null;
    tanggal: string;
    waktu: string;
    dokter_id: string;
    dokter_nama: string;
    keluhan: string | null;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "CHECKIN";
    catatan_admin: string | null;
    notifikasi_terkirim: boolean;
    no_rawat: string | null;
    created_at: string;
}

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Menunggu", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { value: "CONFIRMED", label: "Dikonfirmasi", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "COMPLETED", label: "Selesai", color: "text-green-600 bg-green-50 border-green-200" },
    { value: "CANCELLED", label: "Dibatalkan", color: "text-red-600 bg-red-50 border-red-200" },
    { value: "CHECKIN", label: "Check-In SIMRS", color: "text-purple-600 bg-purple-50 border-purple-200" },
];

export default function BookingDetail() {
    const { id } = useParams();
    const { addToast } = useToast();
    const confirm = useConfirm();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [catatan, setCatatan] = useState("");
    const [status, setStatus] = useState("");
    const [nik, setNik] = useState("");
    const [alamat, setAlamat] = useState("");
    const [noRkmMedis, setNoRkmMedis] = useState<string | null>(null);
    const [checkingRm, setCheckingRm] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Check patient RM status
    const checkPatientRM = async () => {
        if (!nik || nik.length < 16) return;
        setCheckingRm(true);
        const response = await apiGet<{ exists: boolean; no_rkm_medis: string | null }>(`/booking/${id}/patient`);
        if (response.success && response.data) {
            setNoRkmMedis(response.data.no_rkm_medis);
        }
        setCheckingRm(false);
    };

    useEffect(() => {
        const fetchBooking = async () => {
            setLoading(true);
            const response = await apiGet<Booking>(`/booking/${id}`);
            if (response.success && response.data) {
                setBooking(response.data);
                setCatatan(response.data.catatan_admin || "");
                setStatus(response.data.status);
                setNik(response.data.nik || "");
                setAlamat(response.data.alamat || "");
            }
            setLoading(false);
        };
        fetchBooking();
    }, [id]);

    // Check RM when NIK is loaded or changed
    useEffect(() => {
        if (nik && nik.length === 16 && !loading) {
            checkPatientRM();
        } else {
            setNoRkmMedis(null);
        }
    }, [nik, loading]);

    const handleUpdate = async () => {
        setSaving(true);
        const response = await apiPut(`/booking/${id}`, {
            status,
            catatan_admin: catatan,
            nik,
            alamat
        });
        if (response.success) {
            setBooking(prev => prev ? { ...prev, nik, alamat, status: status as Booking["status"], catatan_admin: catatan } : null);
            addToast('success', 'Booking berhasil diperbarui!', 'Berhasil');
            // Re-check RM after saving NIK
            if (nik && nik.length === 16) {
                checkPatientRM();
            }
        } else {
            addToast('error', response.error || 'Gagal memperbarui booking', 'Gagal');
        }
        setSaving(false);
    };

    const handleOpenRegisterModal = () => {
        setShowRegisterModal(true);
    };

    const handleRegistrationSuccess = (noRkmMedis: string) => {
        setNoRkmMedis(noRkmMedis);
        addToast('success', `No. RM: ${noRkmMedis}`, 'Pasien Berhasil Didaftarkan');
    };

    const handleTransfer = async () => {
        if (!noRkmMedis) {
            addToast('warning', 'Daftarkan pasien ke SIMRS terlebih dahulu', 'Pasien Belum Terdaftar');
            return;
        }

        const confirmed = await confirm({
            title: 'Transfer ke SIMRS',
            message: 'Apakah Anda yakin ingin mentransfer booking ini ke SIMRS?',
            confirmText: 'Ya, Transfer',
            cancelText: 'Batal',
            type: 'info'
        });

        if (!confirmed) return;

        setSaving(true);
        const response = await apiPost(`/booking/${id}/transfer`, {});
        if (response.success) {
            const data = response.data as { no_rawat: string };
            addToast('success', `No. Rawat: ${data.no_rawat}`, 'Transfer Berhasil');
            setBooking(prev => prev ? { ...prev, status: "COMPLETED", no_rawat: data.no_rawat } : null);
            setStatus("COMPLETED");
        } else {
            addToast('error', response.error || response.message || 'Gagal transfer ke SIMRS', 'Transfer Gagal');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!booking) return <div className="p-6">Booking tidak ditemukan.</div>;

    const waLink = `https://wa.me/${booking.telepon.replace(/^0/, "62")}`;

    return (
        <>
            <PageMeta title={`Detail Booking ${booking.kode_booking} | Makula Bahalap`} />
            <PageBreadcrumb pageTitle="Detail Booking" />

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Information Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {booking.kode_booking}
                                </h3>
                                <p className="text-sm text-gray-500">Dibuat pada {new Date(booking.created_at).toLocaleString('id-ID')}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${STATUS_OPTIONS.find(o => o.value === booking.status)?.color}`}>
                                {STATUS_OPTIONS.find(o => o.value === booking.status)?.label}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mt-8 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Nama Pasien</span>
                                    <p className="text-gray-900 dark:text-white font-medium text-base">{booking.nama_pasien}</p>
                                </div>
                                <div>
                                    <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Telepon / WhatsApp</span>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium text-base">
                                        {booking.telepon}
                                        <a href={waLink} target="_blank" rel="noreferrer" className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Email</span>
                                    <p className="text-gray-900 dark:text-white font-medium text-base">{booking.email || "-"}</p>
                                </div>
                                <div>
                                    <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">NIK</span>
                                    <p className="text-gray-900 dark:text-white font-medium text-base">{booking.nik || <span className="text-orange-500">Belum diisi</span>}</p>
                                </div>
                                <div>
                                    <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Alamat</span>
                                    <p className="text-gray-900 dark:text-white font-medium text-base">{booking.alamat || "-"}</p>
                                </div>
                                {booking.no_rawat && (
                                    <div>
                                        <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">No. Rawat SIMRS</span>
                                        <p className="text-purple-600 font-bold text-base">{booking.no_rawat}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Jadwal Kunjungan</span>
                                    <div className="text-gray-900 dark:text-white font-medium text-base">
                                        <p>{new Date(booking.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                                        <p className="text-gray-500 font-normal">Jam {booking.waktu.slice(0, 5)} WIB</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Dokter Spesialis</span>
                                    <p className="text-gray-900 dark:text-white font-medium text-base">{booking.dokter_nama}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <span className="block text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-2">Keluhan / Catatan Pasien</span>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-700 dark:text-gray-300 italic">
                                {booking.keluhan || "Tidak ada keluhan yang dituliskan."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-4">Kelola Status</h4>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Update Status</label>
                                <select
                                    className="w-full px-4 py-2 bg-transparent border border-gray-200 rounded-lg dark:border-gray-800 dark:text-white"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SIMRS Data Section */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h5 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">Data SIMRS</h5>
                                <div className="space-y-3">
                                    {/* No Rekam Medis Display */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">No. Rekam Medis</label>
                                        {checkingRm ? (
                                            <p className="text-sm text-gray-400">Mengecek...</p>
                                        ) : noRkmMedis ? (
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
                                                    {noRkmMedis}
                                                </span>
                                                <span className="text-xs text-green-600">✓ Terdaftar</span>
                                            </div>
                                        ) : nik && nik.length === 16 ? (
                                            <div className="space-y-2">
                                                <p className="text-xs text-orange-500">⚠️ Pasien belum terdaftar di SIMRS</p>
                                                <button
                                                    onClick={handleOpenRegisterModal}
                                                    disabled={showRegisterModal}
                                                    className="w-full py-2 bg-orange-500 text-white text-sm rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                    Daftarkan ke SIMRS
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400">Isi NIK terlebih dahulu</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">NIK Pasien</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-transparent border border-gray-200 rounded-lg dark:border-gray-800 dark:text-white text-sm"
                                            placeholder="16 digit NIK"
                                            maxLength={16}
                                            value={nik}
                                            onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                                        />
                                        {!nik && <p className="text-xs text-orange-500 mt-1">⚠️ NIK diperlukan untuk transfer ke SIMRS</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Alamat</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-transparent border border-gray-200 rounded-lg dark:border-gray-800 dark:text-white text-sm"
                                            placeholder="Alamat pasien"
                                            value={alamat}
                                            onChange={(e) => setAlamat(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Catatan Admin (Internal)</label>
                                <textarea
                                    className="w-full px-4 py-2 bg-transparent border border-gray-200 rounded-lg dark:border-gray-800 dark:text-white text-sm"
                                    rows={4}
                                    placeholder="Tambahkan catatan internal di sini..."
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={saving}
                                className="w-full py-3 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition disabled:opacity-50"
                            >
                                {saving ? "Menyimpan..." : "Simpan Perbaikan"}
                            </button>

                            {booking.status === "CONFIRMED" && (
                                <button
                                    onClick={handleTransfer}
                                    disabled={saving}
                                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Transfer ke SIMRS
                                </button>
                            )}
                        </div>
                    </div>

                    <Link to="/booking" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali ke Daftar
                    </Link>
                </div>
            </div>

            {/* Patient Registration Modal */}
            {booking && (
                <PatientRegistrationModal
                    isOpen={showRegisterModal}
                    onClose={() => setShowRegisterModal(false)}
                    onSuccess={handleRegistrationSuccess}
                    bookingId={booking.id}
                    initialData={{
                        nama: booking.nama_pasien,
                        nik: nik,
                        telepon: booking.telepon,
                        alamat: alamat,
                    }}
                />
            )}
        </>
    );
}
