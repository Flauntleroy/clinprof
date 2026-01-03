import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import RichTextEditor from "../../components/form/RichTextEditor";
import { useToast } from "../../context/ToastContext";
import { apiGet, apiPost, apiPut, apiUpload, getMediaUrl } from "../../lib/api";

interface Kategori {
    id: string;
    nama: string;
    slug: string;
}

interface BeritaData {
    id?: string;
    judul: string;
    excerpt: string;
    konten: string;
    thumbnail: string;
    kategori_id: string;
    status: "draft" | "published" | "scheduled";
    published_at: string;
    meta_title: string;
    meta_description: string;
}

interface BeritaFormProps {
    isEdit?: boolean;
}

export default function BeritaForm({ isEdit = false }: BeritaFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Kategori[]>([]);
    const [showSeoFields, setShowSeoFields] = useState(false);

    const [formData, setFormData] = useState<BeritaData>({
        judul: "",
        excerpt: "",
        konten: "",
        thumbnail: "",
        kategori_id: "",
        status: "draft",
        published_at: "",
        meta_title: "",
        meta_description: "",
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiGet<Kategori[]>("/berita/kategori");
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isEdit && id) {
            const fetchBerita = async () => {
                setLoading(true);
                try {
                    const response = await apiGet<BeritaData>(`/berita/${id}`);
                    if (response.success && response.data) {
                        const data = response.data;
                        setFormData({
                            judul: data.judul || "",
                            excerpt: data.excerpt || "",
                            konten: data.konten || "",
                            thumbnail: data.thumbnail || "",
                            kategori_id: data.kategori_id || "",
                            status: data.status || "draft",
                            published_at: data.published_at ? data.published_at.slice(0, 16) : "",
                            meta_title: data.meta_title || "",
                            meta_description: data.meta_description || "",
                        });
                        if (data.meta_title || data.meta_description) {
                            setShowSeoFields(true);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch berita:", err);
                    setError("Gagal memuat data berita");
                }
                setLoading(false);
            };
            fetchBerita();
        }
    }, [isEdit, id]);

    const handleChange = (field: keyof BeritaData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            addToast('error', 'Tipe file tidak diizinkan. Gunakan: JPG, PNG, GIF, WEBP');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            addToast('error', 'Ukuran file maksimal 5MB');
            return;
        }

        setUploading(true);
        try {
            const result = await apiUpload(file);
            if (result.success && result.data?.url) {
                handleChange('thumbnail', result.data.url);
                addToast('success', 'Gambar berhasil diupload', 'Berhasil!');
            } else {
                addToast('error', result.error || 'Gagal mengupload gambar');
            }
        } catch (err) {
            console.error('Upload error:', err);
            addToast('error', 'Terjadi kesalahan saat mengupload');
        }
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.judul.trim()) {
            setError("Judul wajib diisi");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
                ...formData,
                published_at: formData.status === "scheduled" && formData.published_at
                    ? formData.published_at
                    : null,
            };

            let response;
            if (isEdit && id) {
                response = await apiPut(`/berita/${id}`, payload);
            } else {
                response = await apiPost("/berita", payload);
            }

            if (response.success) {
                addToast(
                    'success',
                    isEdit ? 'Berita berhasil diperbarui' : 'Berita berhasil dibuat',
                    'Berhasil!'
                );
                navigate("/berita");
            } else {
                setError(response.error || "Gagal menyimpan berita");
                addToast('error', response.error || "Gagal menyimpan berita");
            }
        } catch (err) {
            console.error("Failed to save berita:", err);
            setError("Terjadi kesalahan saat menyimpan");
            addToast('error', "Terjadi kesalahan saat menyimpan");
        }
        setSaving(false);
    };

    const handleSaveDraft = async () => {
        setFormData((prev) => ({ ...prev, status: "draft" }));
        // Small delay to ensure state update
        setTimeout(() => {
            document.getElementById("berita-form")?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
            );
        }, 100);
    };

    const handlePublish = async () => {
        setFormData((prev) => ({ ...prev, status: "published" }));
        setTimeout(() => {
            document.getElementById("berita-form")?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
            );
        }, 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <>
            <PageMeta title={`${isEdit ? "Edit" : "Tambah"} Berita | Makula Bahalap`} />
            <PageBreadcrumb pageTitle={`${isEdit ? "Edit" : "Tambah"} Berita`} />

            <form id="berita-form" onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Judul Berita *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.judul}
                                        onChange={(e) => handleChange("judul", e.target.value)}
                                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        placeholder="Masukkan judul berita..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Ringkasan (Excerpt)
                                    </label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) => handleChange("excerpt", e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                                        placeholder="Ringkasan singkat artikel (opsional)..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Konten Artikel
                            </label>
                            <RichTextEditor
                                value={formData.konten}
                                onChange={(value) => handleChange("konten", value)}
                                placeholder="Tulis konten artikel di sini..."
                            />
                            <p className="mt-3 text-xs text-gray-500">
                                Gunakan toolbar di atas untuk formatting: heading, bold, italic, list, warna, link, gambar, dll.
                            </p>
                        </div>

                        {/* SEO Fields */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowSeoFields(!showSeoFields)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <span className="font-medium text-gray-700 dark:text-gray-200">SEO Settings</span>
                                <svg
                                    className={`w-5 h-5 transition-transform ${showSeoFields ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showSeoFields && (
                                <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="pt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.meta_title}
                                            onChange={(e) => handleChange("meta_title", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            placeholder="Judul untuk SEO (opsional)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Meta Description
                                        </label>
                                        <textarea
                                            value={formData.meta_description}
                                            onChange={(e) => handleChange("meta_description", e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                                            placeholder="Deskripsi untuk SEO (opsional)"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish Box */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Publikasi</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange("status", e.target.value as BeritaData["status"])}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                </div>

                                {formData.status === "scheduled" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Jadwal Publish
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.published_at}
                                            onChange={(e) => handleChange("published_at", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        disabled={saving}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        Simpan Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePublish}
                                        disabled={saving}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
                                    >
                                        {saving ? "Menyimpan..." : "Publish"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Kategori */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Kategori</h3>
                            <select
                                value={formData.kategori_id}
                                onChange={(e) => handleChange("kategori_id", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Featured Image */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Featured Image</h3>
                            <div className="space-y-4">
                                {formData.thumbnail ? (
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                                        <img
                                            src={getMediaUrl(formData.thumbnail)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <label className="cursor-pointer px-4 py-2 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition">
                                                Ganti
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => handleChange("thumbnail", "")}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer transition ${uploading
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                        : 'border-gray-300 hover:border-brand-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:bg-gray-800'
                                        }`}>
                                        {uploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-3"></div>
                                                <p className="text-sm text-brand-600 dark:text-brand-400">Mengupload...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium text-brand-600">Klik untuk upload</span> atau drag & drop
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WEBP (maks. 5MB)</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
