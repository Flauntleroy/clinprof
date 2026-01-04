import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPut, apiPost, PaginatedData } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";

interface Booking {
    id: string;
    kode_booking: string;
    nama_pasien: string;
    nik: string | null;
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700" },
    COMPLETED: { label: "Selesai", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
    CHECKIN: { label: "Check-In SIMRS", color: "bg-purple-100 text-purple-700" },
};

export default function BookingList() {
    const { addToast } = useToast();
    const confirm = useConfirm();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("");
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchBookings = async () => {
        setLoading(true);
        const endpoint = filter ? `/booking?status=${filter}` : "/booking";
        const response = await apiGet<PaginatedData<Booking>>(endpoint);
        if (response.success && response.data) {
            setBookings(response.data.items);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdating(id);
        const response = await apiPut(`/booking/${id}`, { status: newStatus });
        if (response.success) {
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status: newStatus as Booking["status"] } : b))
            );
        }
        setUpdating(null);
    };

    const handleTransfer = async (id: string) => {
        const confirmed = await confirm({
            title: 'Transfer ke SIMRS',
            message: 'Transfer booking ini ke SIMRS? Pastikan NIK pasien sudah terisi dan terdaftar di SIMRS.',
            confirmText: 'Ya, Transfer',
            cancelText: 'Batal',
            type: 'info'
        });
        if (!confirmed) return;

        setUpdating(id);
        const response = await apiPost(`/booking/${id}/transfer`, {});
        if (response.success) {
            addToast('success', `No. Rawat: ${(response.data as { no_rawat: string }).no_rawat}`, 'Transfer Berhasil');
            fetchBookings();
        } else {
            addToast('error', response.error || response.message || 'Unknown error', 'Transfer Gagal');
        }
        setUpdating(null);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            <PageMeta title="Daftar Booking | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Daftar Booking" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Reservasi Pasien
                    </h3>
                    <div className="flex items-center gap-3">
                        {/* Filter */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="">Semua Status</option>
                            <option value="PENDING">Menunggu</option>
                            <option value="CONFIRMED">Dikonfirmasi</option>
                            <option value="COMPLETED">Selesai</option>
                            <option value="CANCELLED">Dibatalkan</option>
                        </select>
                        <Link
                            to="/booking/calendar"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Kalender
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Belum ada data booking</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kode</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Pasien</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Jadwal</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Dokter</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-brand-600">
                                                {booking.kode_booking}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white/90">
                                                    {booking.nama_pasien}
                                                </p>
                                                <p className="text-sm text-gray-500">{booking.telepon}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-gray-800 dark:text-white/90">{formatDate(booking.tanggal)}</p>
                                                <p className="text-sm text-gray-500">{booking.waktu} WIB</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {booking.dokter_nama}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                disabled={updating === booking.id}
                                                className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${STATUS_LABELS[booking.status]?.color || "bg-gray-100"}`}
                                            >
                                                <option value="PENDING">Menunggu</option>
                                                <option value="CONFIRMED">Dikonfirmasi</option>
                                                <option value="COMPLETED">Selesai</option>
                                                <option value="CANCELLED">Dibatalkan</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Terima Booking Button - only for PENDING */}
                                                {booking.status === "PENDING" && (
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
                                                        disabled={updating === booking.id}
                                                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-1"
                                                        title="Terima Booking"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Terima
                                                    </button>
                                                )}
                                                <a
                                                    href={`https://wa.me/${booking.telepon.replace(/^0/, "62")}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                                    title="Hubungi via WhatsApp"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </a>
                                                <Link
                                                    to={`/booking/${booking.id}`}
                                                    className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 rounded-lg transition"
                                                    title="Lihat Detail"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                {booking.status === "CONFIRMED" && (
                                                    <button
                                                        onClick={() => handleTransfer(booking.id)}
                                                        disabled={updating === booking.id}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition disabled:opacity-50"
                                                        title="Transfer ke SIMRS"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
