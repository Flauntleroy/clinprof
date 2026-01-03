import { useState, useEffect } from "react";
import { Link } from "@/lib/react-router";
import PageBreadcrumb from "@/components/dashboard/common/PageBreadcrumb";
import PageMeta from "@/components/dashboard/common/PageMeta";
import { apiGet, apiDelete, PaginatedData } from "@/lib/dashboard/api";

interface Fasilitas {
    id: string;
    nama: string;
    deskripsi: string;
    foto: string | null;
    kategori: "FASILITAS" | "TEKNOLOGI";
    is_active: boolean;
    created_at: string;
}

export default function FasilitasList() {
    const [facilities, setFacilities] = useState<Fasilitas[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"FASILITAS" | "TEKNOLOGI">("FASILITAS");

    const fetchFacilities = async () => {
        setLoading(true);
        const response = await apiGet<PaginatedData<Fasilitas>>(`/fasilitas?kategori=${activeTab}&active=false`);
        if (response.success && response.data) {
            setFacilities(response.data.items);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFacilities();
    }, [activeTab]);

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

        setDeleting(id);
        const response = await apiDelete(`/fasilitas/${id}`);
        if (response.success) {
            setFacilities(facilities.filter((f) => f.id !== id));
        } else {
            alert(response.error || "Gagal menghapus");
        }
        setDeleting(null);
    };

    return (
        <>
            <PageMeta title="Fasilitas & Teknologi | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Fasilitas & Teknologi" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("FASILITAS")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "FASILITAS"
                                    ? "bg-brand-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Fasilitas
                        </button>
                        <button
                            onClick={() => setActiveTab("TEKNOLOGI")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "TEKNOLOGI"
                                    ? "bg-brand-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Teknologi
                        </button>
                    </div>
                    <Link
                        to="/fasilitas/tambah"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah {activeTab === "FASILITAS" ? "Fasilitas" : "Teknologi"}
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : facilities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p>Belum ada data {activeTab.toLowerCase()}</p>
                            <Link to="/fasilitas/tambah" className="mt-2 text-brand-500 hover:underline">
                                Tambah {activeTab.toLowerCase()} pertama
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                            {facilities.map((item) => (
                                <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group">
                                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        {item.foto ? (
                                            <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-800 dark:text-white/90">{item.nama}</h4>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {item.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.deskripsi}</p>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/fasilitas/edit/${item.id}`}
                                                className="flex-1 py-2 text-center text-sm font-medium text-brand-500 border border-brand-500 rounded-lg hover:bg-brand-50 transition"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deleting === item.id}
                                                className="py-2 px-4 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                            >
                                                {deleting === item.id ? "..." : "Hapus"}
                                            </button>
                                        </div>
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



