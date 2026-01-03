import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiDelete, PaginatedData, getMediaUrl } from "../../lib/api";

interface Layanan {
    id: string;
    nama: string;
    deskripsi: string;
    foto: string | null;
    is_active: boolean;
    urutan: number;
    created_at: string;
}

export default function LayananList() {
    const [services, setServices] = useState<Layanan[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchServices = async () => {
        setLoading(true);
        const response = await apiGet<PaginatedData<Layanan>>("/layanan?active=false");
        if (response.success && response.data) {
            setServices(response.data.items);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return;

        setDeleting(id);
        const response = await apiDelete(`/layanan/${id}`);
        if (response.success) {
            setServices(services.filter((s) => s.id !== id));
        } else {
            alert(response.error || "Gagal menghapus layanan");
        }
        setDeleting(null);
    };

    return (
        <>
            <PageMeta title="Daftar Layanan | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Daftar Layanan" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Layanan Klinik
                    </h3>
                    <Link
                        to="/layanan/tambah"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Layanan
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p>Belum ada data layanan</p>
                            <Link to="/layanan/tambah" className="mt-2 text-brand-500 hover:underline">
                                Tambah layanan pertama
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Layanan</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Deskripsi</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-gray-800 flex items-center justify-center text-brand-600 overflow-hidden">
                                                    {service.foto ? (
                                                        <img src={getMediaUrl(service.foto)} alt={service.nama} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800 dark:text-white/90">{service.nama}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <p className="truncate max-w-xs">{service.deskripsi}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${service.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {service.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/layanan/edit/${service.id}`}
                                                    className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    disabled={deleting === service.id}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                >
                                                    {deleting === service.id ? (
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
