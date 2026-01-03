import { useState, useEffect } from "react";
import { Link } from "@/lib/react-router";
import PageBreadcrumb from "@/components/dashboard/common/PageBreadcrumb";
import PageMeta from "@/components/dashboard/common/PageMeta";
import { apiGet, apiDelete, PaginatedData } from "@/lib/dashboard/api";

interface Dokter {
    id: string;
    nama: string;
    spesialisasi: string;
    foto: string | null;
    bio: string | null;
    is_active: boolean;
    created_at: string;
}

export default function DokterList() {
    const [doctors, setDoctors] = useState<Dokter[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchDoctors = async () => {
        setLoading(true);
        const response = await apiGet<PaginatedData<Dokter>>("/dokter?active=false");
        if (response.success && response.data) {
            setDoctors(response.data.items);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus dokter ini?")) return;

        setDeleting(id);
        const response = await apiDelete(`/dokter/${id}`);
        if (response.success) {
            setDoctors(doctors.filter((d) => d.id !== id));
        } else {
            alert(response.error || "Gagal menghapus dokter");
        }
        setDeleting(null);
    };

    return (
        <>
            <PageMeta title="Daftar Dokter | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Daftar Dokter" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Dokter Spesialis
                    </h3>
                    <Link
                        to="/dokter/tambah"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Dokter
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p>Belum ada data dokter</p>
                            <Link to="/dokter/tambah" className="mt-2 text-brand-500 hover:underline">
                                Tambah dokter pertama
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Dokter
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Spesialisasi
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {doctors.map((doctor) => (
                                    <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">
                                                    {doctor.nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white/90">
                                                        {doctor.nama}
                                                    </p>
                                                    {doctor.bio && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                            {doctor.bio}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {doctor.spesialisasi}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${doctor.is_active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {doctor.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/dokter/edit/${doctor.id}`}
                                                    className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(doctor.id)}
                                                    disabled={deleting === doctor.id}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                >
                                                    {deleting === doctor.id ? (
                                                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
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



