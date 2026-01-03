import { useState, useEffect } from "react";
import PageMeta from "@/components/dashboard/common/PageMeta";
import { apiGet, PaginatedData } from "@/lib/dashboard/api";

interface Stats {
    totalBooking: number;
    bookingHariIni: number;
    bookingPending: number;
    totalDokter: number;
}

interface RecentBooking {
    id: string;
    kode_booking: string;
    nama_pasien: string;
    tanggal: string;
    waktu: string;
    status: string;
    dokter_nama: string;
}

export default function DashboardHome() {
    const [stats, setStats] = useState<Stats>({
        totalBooking: 0,
        bookingHariIni: 0,
        bookingPending: 0,
        totalDokter: 0,
    });
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch recent bookings
            const bookingRes = await apiGet<PaginatedData<RecentBooking>>("/booking?perPage=5");
            if (bookingRes.success && bookingRes.data) {
                setRecentBookings(bookingRes.data.items);
                // Calculate stats from data
                const today = new Date().toISOString().split('T')[0];
                setStats(prev => ({
                    ...prev,
                    totalBooking: bookingRes.data!.total,
                    bookingPending: bookingRes.data!.items.filter(b => b.status === 'PENDING').length,
                    bookingHariIni: bookingRes.data!.items.filter(b => b.tanggal === today).length,
                }));
            }

            // Fetch doctors count
            const dokterRes = await apiGet<PaginatedData<unknown>>("/dokter");
            if (dokterRes.success && dokterRes.data) {
                setStats(prev => ({ ...prev, totalDokter: dokterRes.data!.total }));
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-700",
            CONFIRMED: "bg-blue-100 text-blue-700",
            COMPLETED: "bg-green-100 text-green-700",
            CANCELLED: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <>
            <PageMeta title="Dashboard | Makula Bahalap" />

            <div className="space-y-6">
                {/* Welcome */}
                <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">Selamat Datang di Dashboard</h1>
                    <p className="text-white/80">Kelola klinik Makula Bahalap dengan mudah</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Booking */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Booking</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalBooking}</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Hari Ini */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Hari Ini</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.bookingHariIni}</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Pending */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Menunggu</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.bookingPending}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Dokter */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Dokter</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalDokter}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Booking Terbaru
                        </h3>
                        <a href="/booking" className="text-sm text-brand-500 hover:underline">
                            Lihat Semua
                        </a>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : recentBookings.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            Belum ada booking
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">
                                            {booking.nama_pasien.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white/90">{booking.nama_pasien}</p>
                                            <p className="text-sm text-gray-500">{booking.dokter_nama}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{formatDate(booking.tanggal)} • {booking.waktu}</p>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                                            {booking.status === 'PENDING' ? 'Menunggu' : booking.status === 'CONFIRMED' ? 'Dikonfirmasi' : booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}



