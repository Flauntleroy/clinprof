import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { apiGet, apiDelete } from "../../lib/api";

interface Berita {
    id: string;
    judul: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    kategori_nama: string | null;
    status: "draft" | "published" | "scheduled";
    views: number;
    published_at: string | null;
    created_at: string;
}

interface Kategori {
    id: string;
    nama: string;
    slug: string;
}

interface PaginatedResponse {
    items: Berita[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function BeritaList() {
    const { addToast } = useToast();
    const confirm = useConfirm();
    const [loading, setLoading] = useState(true);
    const [berita, setBerita] = useState<Berita[]>([]);
    const [categories, setCategories] = useState<Kategori[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({
        status: "all",
        kategori: "",
        search: "",
    });
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchBerita = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: "10",
            });
            if (filters.status !== "all") params.append("status", filters.status);
            if (filters.kategori) params.append("kategori", filters.kategori);
            if (filters.search) params.append("search", filters.search);

            const response = await apiGet<PaginatedResponse>(`/berita?${params}`);
            if (response.success && response.data) {
                setBerita(response.data.items);
                setPagination({
                    page: response.data.pagination.page,
                    totalPages: response.data.pagination.totalPages,
                    total: response.data.pagination.total,
                });
            }
        } catch (error) {
            console.error("Failed to fetch berita:", error);
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        try {
            const response = await apiGet<Kategori[]>("/berita/kategori");
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchBerita();
    }, [pagination.page, filters.status, filters.kategori]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchBerita();
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Hapus Berita',
            message: 'Yakin ingin menghapus berita ini?',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger'
        });
        if (!confirmed) return;
        setDeleting(id);
        try {
            const response = await apiDelete(`/berita/${id}`);
            if (response.success) {
                addToast('success', 'Berita berhasil dihapus', 'Berhasil!');
                fetchBerita();
            } else {
                addToast('error', response.error || 'Gagal menghapus berita');
            }
        } catch (error) {
            console.error("Failed to delete berita:", error);
            addToast('error', 'Terjadi kesalahan saat menghapus');
        }
        setDeleting(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Published
                    </span>
                );
            case "draft":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Draft
                    </span>
                );
            case "scheduled":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Scheduled
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            <PageMeta title="Kelola Berita | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Berita & Artikel" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filters.status}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, status: e.target.value }));
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="all">Semua Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                        <select
                            value={filters.kategori}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, kategori: e.target.value }));
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nama}
                                </option>
                            ))}
                        </select>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                placeholder="Cari berita..."
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/berita/kategori"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Kategori
                        </Link>
                        <Link
                            to="/berita/tambah"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Berita
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : berita.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            Belum ada berita
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Berita</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {berita.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {item.thumbnail ? (
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.judul}
                                                        className="w-16 h-12 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                                        {item.judul}
                                                    </h4>
                                                    {item.excerpt && (
                                                        <p className="text-sm text-gray-500 line-clamp-1">{item.excerpt}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {item.kategori_nama || "-"}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {item.views.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/berita/edit/${item.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition dark:hover:bg-blue-900/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={deleting === item.id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 dark:hover:bg-red-900/30"
                                                >
                                                    {deleting === item.id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan {berita.length} dari {pagination.total} berita
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
