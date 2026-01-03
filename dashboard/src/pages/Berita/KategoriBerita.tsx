import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import { apiGet, apiPost, apiDelete } from "../../lib/api";

interface Kategori {
    id: string;
    nama: string;
    slug: string;
    deskripsi: string | null;
    created_at: string;
}

export default function KategoriBerita() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Kategori[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ nama: "", deskripsi: "" });
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await apiGet<Kategori[]>("/berita/kategori");
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nama.trim()) {
            setError("Nama kategori wajib diisi");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const response = await apiPost("/berita/kategori", formData);
            if (response.success) {
                addToast('success', 'Kategori berhasil dibuat', 'Berhasil!');
                setFormData({ nama: "", deskripsi: "" });
                setShowForm(false);
                fetchCategories();
            } else {
                setError(response.error || "Gagal membuat kategori");
                addToast('error', response.error || 'Gagal membuat kategori');
            }
        } catch (err) {
            console.error("Failed to create category:", err);
            setError("Terjadi kesalahan");
            addToast('error', 'Terjadi kesalahan');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        setDeleting(id);
        try {
            const response = await apiDelete(`/berita/kategori?id=${id}`);
            if (response.success) {
                addToast('success', 'Kategori berhasil dihapus', 'Berhasil!');
                fetchCategories();
            } else {
                addToast('error', response.error || 'Gagal menghapus kategori');
            }
        } catch (err) {
            console.error("Failed to delete category:", err);
            addToast('error', 'Terjadi kesalahan saat menghapus');
        }
        setDeleting(null);
    };

    return (
        <>
            <PageMeta title="Kategori Berita | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Kategori Berita" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola kategori untuk mengelompokkan artikel
                    </p>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Kategori
                    </button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tambah Kategori Baru</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Nama Kategori *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        placeholder="Contoh: Kesehatan Mata"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Deskripsi (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        placeholder="Deskripsi singkat kategori"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
                                >
                                    {saving ? "Menyimpan..." : "Simpan Kategori"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormData({ nama: "", deskripsi: "" });
                                        setError("");
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-200"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories List */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Belum ada kategori
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {cat.nama}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                {cat.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {cat.deskripsi || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    disabled={deleting === cat.id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 dark:hover:bg-red-900/30"
                                                >
                                                    {deleting === cat.id ? (
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
            </div>
        </>
    );
}
